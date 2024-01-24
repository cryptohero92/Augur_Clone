import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import MainPanel from "../../component/Event/MainPanel";
import RightPanel from "../../component/Event/RightPanel";

export default function EventView() {
    const { eventID } = useParams();
    const [eventInfo, setEventInfo] = useState(null)
    // from eventId, need to get 
    // how to get orders for each bettingOptions.
    // we now know eventId, and if there is no bettingOption, then we can find orders from the eventID as key.
    // if there are bettingOptions, we can find orders from bettingOption url as key.
    // for now, let me show title, detail, image, category and endDate.
    // So, getOrdersByKey function will get orders from database.
    // after getting orders, will show it 
    // MainPanel will have main info. 
    // for now, need to know if url exist or not.
    // And if url exist, then, will show MainPanel and RightPanel ?
    // When order is made on rightPanel, it will be saved to the bettingOption.
    // So, for now, in EventView page, let's check if url exist, and if not exist, will show "There is no such an event" message.
    // at first, show there is no such an event, and once fetch succeed, then show MainPanel and RightPanel
    

    useEffect(() => {
        if (eventID) {
            fetch(`https://gateway.pinata.cloud/ipfs/${eventID}`)
            .then((response) => response.json())
            .then(eventInfo => {
                setEventInfo(eventInfo);
            })
            .catch(err => {
              console.error(err);
            })
        }
    }, [eventID])

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
