import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { BigNumberish, formatUnits } from 'ethers'
import { Box, Typography, CardMedia, Button, RadioGroup, Radio, FormControlLabel, CircularProgress } from "@mui/material"
import { useLocalStorage } from "usehooks-ts";

function BettingOption({bettingOption, setBettingOptionResult}: any) {
  const [resultOption, setResultOption] = useState(0);
  const [accessToken] = useLocalStorage<string>('accessToken', '')
  const [isProgressing, setIsProgressing] = useState(false);

  const reportResult = () => {
    setIsProgressing(true)
    fetch(`${import.meta.env.VITE_BACKEND_URL}/events/report`, {
      body: JSON.stringify({
        ipfsUrl: bettingOption.ipfsUrl,
        payouts: [resultOption == 1 ? 1 : 0, resultOption == 2 ? 1 : 0]
      }),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      method: 'POST'
    })
    .then((response) => {
        if (response.status != 200) {
            throw new Error('Error happened')
        } else {
            return response.json()
        }
    })
    // If yes, retrieve it. If no, create it.
    .then((res) => {
        debugger
        setBettingOptionResult({ipfsUrl: bettingOption.ipfsUrl, result: res.result});
        setIsProgressing(false)
    })
    .catch(err => {
        setIsProgressing(false)
        console.error(err);
    });
  }

  const renderResultPart = () => {
    if (bettingOption.result == 1) {
      return (
        <>Result is YES!</>
      )  
    } else if (bettingOption.result == 2) {
      return (
        <>Result is NO!</>
      )
    } else {
      return (
        <Box>
          <Typography>Set Result of Event</Typography>
          <Box sx={{display: 'flex'}}>
            <RadioGroup
              aria-labelledby="demo-radio-buttons-group-label"
              name="radio-buttons-group"
              onChange={(event) => setResultOption(event.target.value)}
              value={resultOption}
              row
            >
              <FormControlLabel value="1" control={<Radio />} label="YES" />
              <FormControlLabel value="2" control={<Radio />} label="NO" />
            </RadioGroup>
            <Button
              disabled={isProgressing}
              sx={{background: 'green', color: 'white'}}
              onClick={reportResult}
            >
              Set Result
            </Button>
            { isProgressing && (<CircularProgress />)}
          </Box>
        </Box>        
      )
    }  
  }

  return (
    <Box>
      { bettingOption.title ? (<>
        <CardMedia
          sx={{ height: 80, width:80, minWidth: 80, ml: '1rem' }}
          image={`https://gateway.pinata.cloud/ipfs/${bettingOption.image}`}
        />
        <Typography>{bettingOption.title}</Typography>
      </>) : (<>
        
      </>) }
      { renderResultPart() }
    </Box>
  )
}

export default function EventReport() {
    const { ipfsUrl } = useParams(); 

    const [eventInfo,setEventInfo] = useState(null);

    useEffect(() => {
        if (ipfsUrl) {
            let item: any = {
                ipfsUrl
            };

            fetch(`https://gateway.pinata.cloud/ipfs/${ipfsUrl}`)
            .then((response) => response.json())
            .then(eventInfo => {
              item.title = eventInfo.title
              item.detail = eventInfo.detail
              item.image = eventInfo.image
              item.category = eventInfo.category
              item.endDate = eventInfo.endDate
              let promises = [];
              for (let i = 0; i < eventInfo.bettingOptions.length; i++) {
                const contractPromise1 = fetch(`${import.meta.env.VITE_BACKEND_URL}/contract/getBetAmountOfBettingOption/${eventInfo.bettingOptions[i]}`)
                .then((response) => response.json())
                .then(({betAmount}) => ({
                    bet: betAmount
                }))
                .catch((err) => {
                    console.log(err);
                });

                const contractPromise2 = fetch(`${import.meta.env.VITE_BACKEND_URL}/contract/getResultOfBettingOption/${eventInfo.bettingOptions[i]}`)
                .then((response) => response.json())
                .then(({result}) => ({
                    result
                }))
                .catch((err) => {
                    console.log(err);
                });

                const ipfsPromise = fetch(`https://gateway.pinata.cloud/ipfs/${eventInfo.bettingOptions[i]}`).then((response) => response.json()).then(optionInfo => ({
                  title: optionInfo.title,
                  image: optionInfo.image
                }));

                promises.push(Promise.all([contractPromise1, contractPromise2, ipfsPromise])
                  .then((results) => (Object.assign({ipfsUrl: eventInfo.bettingOptions[i]}, ...results)))) 
              }
              Promise.all(promises)
                .then(bettingOptions => {
                  item.bettingOptions = bettingOptions;
                  setEventInfo(item);
                })
            })
            .catch(err => {
              console.error(err);
            })
        }
    }, [ipfsUrl])

    const setBettingOptionResultOfEvent = ({ipfsUrl, result}: any) => {
      for (let i = 0; i < eventInfo.bettingOptions.length; i++) {
        if (eventInfo.bettingOptions[i].ipfsUrl == ipfsUrl) {
          eventInfo.bettingOptions[i].result = result;
          break;
        }
      }
      setEventInfo(eventInfo);
    }

    const renderEvent = () => {
        if (eventInfo) {
            return (
                <Box>
                  <Box>
                    <Box sx={{ display: 'flex' }}>
                        <CardMedia
                            sx={{ height: {md: 90, xs:48}, width: {md: 90, xs: 48}, minWidth: {md: 90, xs: 48}, mr: 1}}
                            image={`https://gateway.pinata.cloud/ipfs/${eventInfo.image}`}
                            title={eventInfo.title}
                        />
                        <Box sx={{ width: 1, rowGap: '0.75rem', flexDirection: 'column', display: 'flex' }}>
                            <Box sx={{ display: 'flex', width: 1, gap: '2rem'}}>
                                <Typography sx={{ background: 'lightgray', p: 0.4}}>{eventInfo.category}</Typography>
                                <Typography sx={{ color: 'gray', p: 0.4, display: { md: 'flex', xs: 'none' } }}>${eventInfo.bettingOptions.reduce((sum, bettingOption) => sum + bettingOption.bet, 0)} Bet</Typography>
                                <Typography sx={{ color: 'gray', p: 0.4, display: { md: 'flex', xs: 'none' } }}>Expires {new Date(eventInfo.endDate).toLocaleDateString('en-us', { year:"numeric", month:"short", day:"numeric"})}</Typography>
                            </Box>
                            <Box sx={{ lineHeight: '32px', fontSize: '32px', display: { md: 'flex', xs: 'none' }}}>{eventInfo.title}</Box>
                        </Box>
                    </Box>
                    <Box sx={{display: { md: 'none', xs: 'flex' }}}><Typography>{eventInfo.title}</Typography></Box>
                  </Box>
                  <Box>
                    {
                      eventInfo.bettingOptions.map((bettingOption, index) => (
                        <BettingOption key={index} bettingOption={bettingOption} setBettingOptionResult={setBettingOptionResultOfEvent} />
                      ))
                    }
                  </Box>
                </Box>
            )
        } else {
            return <>Please wait until Event info arrives...</>
        }
    }

    return (
        <Box
            sx={{ justifyContent: 'center', columnGap: '1.5rem', display: 'flex' }}
        >
            {renderEvent()}
        </Box>
    );
}
