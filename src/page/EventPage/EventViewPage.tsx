import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import MainPanel from "../../component/Event/MainPanel";
import RightPanel from "../../component/Event/RightPanel";

export default function EventView() {
    const { eventID } = useParams();
    const [eventInfo, setEventInfo] = useState(null)    

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
                    <RightPanel  />
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
