import { Box, Typography, CardMedia, Button } from "@mui/material"
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useState } from "react";

export default function MainPanel({eventInfo}: any) {
    // in mainPanel, from eventInfo, extract title, detail, image, endDate, category and use.

    const [moreOrLessSwitch, setMoreOrLessSwitch] = useState(true);
    
    return (
        <Box sx={{ maxWidth: '800px', width: 'calc(100vw - 420px)', marginTop: '2rem' }}>
            <Box>
                <Box sx={{ display: 'flex' }}>
                    <CardMedia
                        sx={{ height: {md: 90, xs:48}, width: {md: 90, xs: 48}, minWidth: {md: 90, xs: 48}, mr: 1}}
                        image={eventInfo.image}
                        title={eventInfo.title}
                    />
                    <Box sx={{ width: 1, rowGap: '0.75rem', flexDirection: 'column', display: 'flex' }}>
                        <Box sx={{ display: 'flex', width: 1, gap: '2rem'}}>
                            <Typography sx={{ background: 'lightgray', p: 0.4}}>{eventInfo.category}</Typography>
                            <Typography sx={{ color: 'gray', p: 0.4, display: { md: 'flex', xs: 'none' } }}>$100 Bet</Typography>
                            <Typography sx={{ color: 'gray', p: 0.4, display: { md: 'flex', xs: 'none' } }}>Expires {new Date(eventInfo.endDate).toLocaleDateString('en-us', { year:"numeric", month:"short", day:"numeric"})}</Typography>
                        </Box>
                        <Box sx={{ lineHeight: '32px', fontSize: '32px', display: { md: 'flex', xs: 'none' }}}>{eventInfo.title}</Box>
                    </Box>
                </Box>
                <Box sx={{display: { md: 'none', xs: 'flex' }}}><Typography>{eventInfo.title}</Typography></Box>
            </Box>
            
            <Box>
                <Typography>About</Typography>
                <hr/>
                <Box>
                    {
                        moreOrLessSwitch ? (<Box sx={{  maxHeight: '2.5rem', overflow: 'hidden' }}>
                        {eventInfo.detail}
                        </Box>) : (<Box>
                            {eventInfo.detail}
                        </Box>)
                    }
                    <Button onClick={() => setMoreOrLessSwitch(!moreOrLessSwitch)}>Show {moreOrLessSwitch ? "more" : "less"} {moreOrLessSwitch ? <KeyboardArrowDownIcon/> : <KeyboardArrowUpIcon/>}</Button>
                </Box>
            </Box>
        </Box>
    )
}