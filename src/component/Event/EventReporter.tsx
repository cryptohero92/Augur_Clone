import { Box, Typography, CardMedia } from '@mui/material';
import { Link } from 'react-router-dom';
import { PublishedEventInfo } from '../../types';

export default function EventReporter({event}: {event: PublishedEventInfo}) {
    return (
        <Box>
            <CardMedia
                sx={{ height: 80, width:80, minWidth: 80, ml: '1rem' }}
                image={`https://gateway.pinata.cloud/ipfs/${event.image}`}
            />
            <Box sx={{ p: 0.6, ml: 0.5 }}>
                <Typography sx={{ color: 'lightgray', fontSize: 12}}>
                    {event.category}
                </Typography>
                <Typography>
                    {event.title}
                </Typography>
            </Box>
            <Link to={`/dashboard/report/${event.ipfsUrl}`} style={{textDecoration: 'none'}}>
                Report
            </Link>
        </Box>        
    )
}