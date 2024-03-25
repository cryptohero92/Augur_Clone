import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import MainPanel from "../../component/Event/MainPanel";
import RightPanel from "../../component/Event/RightPanel";
import { BigNumberish, formatUnits } from 'ethers'

export default function EventView() {
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

    const renderEvent = () => {
        if (eventInfo) {
            return (
                <>
                    <MainPanel eventInfo={eventInfo} />
                    <RightPanel />
                </>
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
