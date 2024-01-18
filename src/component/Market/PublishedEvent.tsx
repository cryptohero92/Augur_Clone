import { Link } from 'react-router-dom';
import { Card, CardMedia, Box, Typography } from '@mui/material';
import ModeCommentOutlinedIcon from '@mui/icons-material/ModeCommentOutlined';
import StarOutlineOutlinedIcon from '@mui/icons-material/StarOutlineOutlined';
import { PublishedEventInfo } from '../../types';



export default function PublishedEvent({event}: {event: PublishedEventInfo}) {
    let total = 0;
    for (let i = 0; i < event.bettingOptions.length; i++) {
        total += event.bettingOptions[i].bet;
    }   

    const renderBettingOptions = () => {
        if (event.resolved == false) {
            if (event.bettingOptions.length == 1) {    
                return (
                    <Box sx={{ height: 32, width: 1, gap: 0.125, display: 'flex'}}>
                        <Box sx={{ background: 'rgba(39, 174, 96, 0.1)',width: '50%', display: 'flex', justifyContent: 'left' }}>
                            <Typography sx={{padding: '5px', whiteSpace: 'nowrap'}}>Yes 50¢</Typography>
                        </Box>
                        <Box sx={{ background: 'rgba(235, 87, 87, 0.1)',width: '50%', display: 'flex', justifyContent: 'right' }}>
                            <Typography sx={{padding: '5px', whiteSpace: 'nowrap'}}>No 50¢</Typography>
                        </Box>
                    </Box>
                )
            } else {
                return (
                    <Box sx={{ height: '90px', overflowY: 'hidden', WebkitMaskImage: 'linear-gradient(white 65%, transparent 100%)'}} >
                        {event.bettingOptions.map((bettingOption, index) => {
                            return (
                                <Box sx={{ display: 'flex', mt: 0.5, justifyContent: 'space-between' }} key={index}>
                                    <Box sx={{ display: 'flex', gap: '0.5rem'}}>
                                        {bettingOption.image ? (<CardMedia
                                            sx={{ height: 24, width:24, minWidth: 24 }}
                                            image={bettingOption.image}
                                            title={bettingOption.title}
                                        />) : null }
                                        <Typography sx={{padding: '5px', whiteSpace: 'nowrap', overflow:'hidden', textOverflow: 'ellipsis', maxWidth: '100px'}}>
                                            {bettingOption.title}
                                        </Typography>
                                        
                                    </Box>
                                    <Box sx={{ width: '140px', gap: 0.125, display: 'flex' }}>
                                        <Box sx={{ background: 'rgba(39, 174, 96, 0.1)',width: `50%`, display: 'flex', justifyContent: 'left' }}>
                                            <Typography sx={{padding: '5px', whiteSpace: 'nowrap'}}>Yes 50¢</Typography>
                                        </Box>
                                        <Box sx={{ background: 'rgba(235, 87, 87, 0.1)',width: `50%`, display: 'flex', justifyContent: 'right' }}>
                                            <Typography sx={{padding: '5px', whiteSpace: 'nowrap'}}>No 50¢</Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            ) 
                        })}
                    </Box>
                )
            }    
        } else {
            // if (event.bettingOptions.length == 1) {
            //     // how to get
            //     let yes_or_no = event.bettingOptions[0].result;
    
            //     return (
            //         <Box sx={{ height: 32, width: 1}}>
            //             {yes_or_no == 0 ? (
            //                 <Box sx={{ background: 'rgba(39, 174, 96, 0.1)',width: 1, display: 'flex', justifyContent: 'left' }}>
            //                 <Typography sx={{padding: '5px', whiteSpace: 'nowrap'}}>Resolved: {event.bettingOptions[0].yes_no ? event.bettingOptions[0].yes_no.yes : "Yes"}</Typography>
            //             </Box>
            //             ) : (
            //                 <Box sx={{ background: 'rgba(235, 87, 87, 0.1)',width:1, display: 'flex', justifyContent: 'right' }}>
            //                 <Typography sx={{padding: '5px', whiteSpace: 'nowrap'}}>Resolved: {event.bettingOptions[0].yes_no ? event.bettingOptions[0].yes_no.no : "No"}</Typography>
            //             </Box>
            //             )}
            //         </Box>
            //     )
            // } else {

            //     return (
            //         <Box sx={{ height: '80px', overflowY: 'hidden', WebkitMaskImage: 'linear-gradient(white 65%, transparent 100%)'}} >
            //             {event.bettingOptions.map((bettingOption, index) => {
            //                 let yes_or_no = bettingOption.result;
    
            //                 return (
            //                     <Box sx={{ display: 'flex', mt: 0.5, justifyContent: 'space-between' }} key={index}>
            //                         <Box sx={{ display: 'flex', gap: '0.5rem'}}>
            //                             {bettingOption.image ? (<CardMedia
            //                                 sx={{ height: 24, width:24, minWidth: 24 }}
            //                                 image={bettingOption.image}
            //                                 title={bettingOption.title}
            //                             />) : null }
            //                             <Typography sx={{padding: '5px', whiteSpace: 'nowrap', overflow:'hidden', textOverflow: 'ellipsis', maxWidth: '120px'}}>
            //                                 {bettingOption.title}
            //                             </Typography>
                                        
            //                         </Box>
            //                         <Box sx={{ width: '140px', gap: 0.125, display: 'flex' }}>
            //                             {yes_or_no == 0 ? (
            //                                 <Box sx={{ background: 'rgba(39, 174, 96, 0.1)',width: 1, display: 'flex', justifyContent: 'left', overflow: 'hidden' }}>
            //                                     <Typography sx={{padding: '5px', whiteSpace: 'nowrap'}}>Resolved: {bettingOption.yes_no ? bettingOption.yes_no.yes : "Yes"}</Typography>
            //                                 </Box>
            //                             ) : (
            //                                 <Box sx={{ background: 'rgba(235, 87, 87, 0.1)',width: 1, display: 'flex', justifyContent: 'left', overflow: 'hidden' }}>
            //                                     <Typography sx={{padding: '5px', whiteSpace: 'nowrap'}}>Resolved: {bettingOption.yes_no ? bettingOption.yes_no.no : "No"}</Typography>
            //                                 </Box>
            //                             )}
            //                         </Box>
            //                     </Box>
            //                 ) 
            //             })}
            //         </Box>
            //     )
            // }
            return null
        }
    };
  
    return (
        <Link to={`/event/${event.ipfsUrl}`} style={{textDecoration: 'none'}}>
            <Card sx={{ height: 200, p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',  "&:hover": { boxShadow: 8 } }}>
                <Box sx={{ display: 'flex', mb: 3}}>
                    <CardMedia
                        sx={{ height: 72, width:72, minWidth: 72 }}
                        image={event.image}
                        title={event.title}
                    />
                    <Box sx={{ p: 0.6, ml: 0.5 }}>
                        <Typography sx={{ color: 'lightgray', fontSize: 12}}>
                            {event.category}
                        </Typography>
                        <Typography>
                            {event.title}
                        </Typography>
                    </Box>
                </Box>
                { renderBettingOptions() }
                <Box sx={{ width: 1, display: 'flex', justifyContent: 'space-between', mt: '10px' }}>
                    <Box>
                        ${total} Bet
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: '0.25rem' }}>
                        <ModeCommentOutlinedIcon />
                        <Typography>
                            {event.comments ? event.comments.length: 0}
                        </Typography>
                        <StarOutlineOutlinedIcon />
                    </Box>
                </Box>  
                
            </Card>
        </Link>
        
    );
}