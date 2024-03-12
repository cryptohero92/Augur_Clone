import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import MainPanel from "../../component/Event/MainPanel";
import RightPanel from "../../component/Event/RightPanel";
import CTFExchangeContract from '../../artifacts/contracts/papaya/CTFExchangeContract.json'
import { readContracts } from '@wagmi/core'
import { config } from "../../wagmi"
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
                const contractPromise = readContracts(config, {
                  contracts: [
                    {
                      abi: CTFExchangeContract.abi,
                      address: CTFExchangeContract.address as `0x${string}`,
                      functionName: 'getBetAmountOfBettingOption',
                      args: [eventInfo.bettingOptions[i]] 
                    },
                    {
                      abi: CTFExchangeContract.abi,
                      address: CTFExchangeContract.address as `0x${string}`,
                      functionName: 'getResultOfBettingOption',
                      args: [eventInfo.bettingOptions[i]]
                    }
                  ]                  
                }).then(res => ({
                  ipfsUrl: eventInfo.bettingOptions[i],
                  bet: Number(formatUnits(res[0].result as BigNumberish, 6)),
                  result: Number(res[1].result)
                }))

                const ipfsPromise = fetch(`https://gateway.pinata.cloud/ipfs/${eventInfo.bettingOptions[i]}`).then((response) => response.json()).then(optionInfo => ({
                  title: optionInfo.title,
                  image: optionInfo.image
                }));

                promises.push(Promise.all([contractPromise, ipfsPromise])
                  .then((results) => (Object.assign({}, ...results)))) 
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
            return <>There is no such an event!</>
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
