import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import MainPanel from "../../component/Event/MainPanel";
import RightPanel from "../../component/Event/RightPanel";
import { getBettingOptionsPromise } from "../../app/constant";

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
              
              getBettingOptionsPromise(eventInfo)
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
