import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import MainPanel from "../../component/Event/MainPanel";
import RightPanel from "../../component/Event/RightPanel";
import { fetchOrders, createOrder, updateOrder, removeOrder } from "../feature/Slices/orderSlice";

export default function EventView() {
    const { ipfsUrl } = useParams(); 

    [eventInfo,setEventInfo] = useState(null);

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
                const contractPromise = readContract(config, {
                  contracts: [
                    {
                      abi: PLSpeakContract.abi,
                      address: PLSpeakContract.address as `0x${string}`,
                      functionName: 'getBetAmountOfBettingOption',
                      args: [eventInfo.bettingOptions[i]] 
                    },
                    {
                      abi: PLSpeakContract.abi,
                      address: PLSpeakContract.address as `0x${string}`,
                      functionName: 'getResultOfBettingOption',
                      args: [eventInfo.bettingOptions[i]]
                    }
                  ]                  
                }).then(res => ({
                  bet: res[0],
                  result: res[1]
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
