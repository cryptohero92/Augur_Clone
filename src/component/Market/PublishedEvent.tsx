import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardMedia, Box, Typography } from '@mui/material';
import ModeCommentOutlinedIcon from '@mui/icons-material/ModeCommentOutlined';
import StarOutlineOutlinedIcon from '@mui/icons-material/StarOutlineOutlined';
import { PublishedEventInfo } from '../../types';

function BettingOptionPrices({ipfsUrl}) {
    const [prices, setPrices] = useState({
        yes: 50,
        no: 50
    });
    useEffect(() => {
        if (ipfsUrl) {
            fetch(`${import.meta.env.VITE_BACKEND_URL}/prices?ipfsUrl=${ipfsUrl}`)
                .then((response) => {
                    if (response.status != 200) {
                        throw new Error('Error happened')
                    } else {
                        return response.json()
                    }
                })
                // If yes, retrieve it. If no, create it.
                .then((prices) => {
                    setPrices(prices)
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }, [ipfsUrl])

    return (
        <>
            <Box sx={{ background: 'rgba(39, 174, 96, 0.1)',width: `${prices.yes}%`, display: 'flex', justifyContent: 'left' }}>
                <Typography sx={{padding: '5px', whiteSpace: 'nowrap'}}>Yes {prices.yes}¢</Typography>
            </Box>
            <Box sx={{ background: 'rgba(235, 87, 87, 0.1)',width: `${prices.no}%`, display: 'flex', justifyContent: 'right' }}>
                <Typography sx={{padding: '5px', whiteSpace: 'nowrap'}}>No {prices.no}¢</Typography>
            </Box>
        </>
    )

}

export default function PublishedEvent({event}: {event: PublishedEventInfo}) {
    let total = 0;
    let resolved = true;
    for (let i = 0; i < event.bettingOptions.length; i++) {
        total += event.bettingOptions[i].bet;
        if (event.bettingOptions[i].result == 0) resolved = false;
    } 
    
    const renderBettingOptions = () => {
        if (resolved == false) {
            if (event.bettingOptions.length == 1) {    
                return (
                    <Box sx={{ height: 32, width: 1, gap: 0.125, display: 'flex'}}>
                        <BettingOptionPrices ipfsUrl={event.bettingOptions[0].ipfsUrl} />
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
                                            image={`https://gateway.pinata.cloud/ipfs/${bettingOption.image}`}
                                            title={bettingOption.title}
                                        />) : null }
                                        <Typography sx={{padding: '5px', whiteSpace: 'nowrap', overflow:'hidden', textOverflow: 'ellipsis', maxWidth: '100px'}}>
                                            {bettingOption.title}
                                        </Typography>
                                        
                                    </Box>
                                    <Box sx={{ width: '140px', gap: 0.125, display: 'flex' }}>
                                        <BettingOptionPrices ipfsUrl={bettingOption.ipfsUrl} />
                                    </Box>
                                </Box>
                            ) 
                        })}
                    </Box>
                )
            }    
        } else {
            if (event.bettingOptions.length == 1) {
                // how to get
                let yes_or_no = event.bettingOptions[0].result;
    
                return (
                    <Box sx={{ height: 32, width: 1}}>
                        {yes_or_no == 1 ? (
                            <Box sx={{ background: 'rgba(39, 174, 96, 0.1)',width: 1, display: 'flex', justifyContent: 'left' }}>
                            <Typography sx={{padding: '5px', whiteSpace: 'nowrap'}}>Resolved: Yes</Typography>
                        </Box>
                        ) : (
                            <Box sx={{ background: 'rgba(235, 87, 87, 0.1)',width:1, display: 'flex', justifyContent: 'right' }}>
                            <Typography sx={{padding: '5px', whiteSpace: 'nowrap'}}>Resolved: No</Typography>
                        </Box>
                        )}
                    </Box>
                )
            } else {

                return (
                    <Box sx={{ height: '80px', overflowY: 'hidden', WebkitMaskImage: 'linear-gradient(white 65%, transparent 100%)'}} >
                        {event.bettingOptions.map((bettingOption, index) => {
                            let yes_or_no = bettingOption.result;
    
                            return (
                                <Box sx={{ display: 'flex', mt: 0.5, justifyContent: 'space-between' }} key={index}>
                                    <Box sx={{ display: 'flex', gap: '0.5rem'}}>
                                        {bettingOption.image ? (<CardMedia
                                            sx={{ height: 24, width:24, minWidth: 24 }}
                                            image={`https://gateway.pinata.cloud/ipfs/${bettingOption.image}`}
                                            title={bettingOption.title}
                                        />) : null }
                                        <Typography sx={{padding: '5px', whiteSpace: 'nowrap', overflow:'hidden', textOverflow: 'ellipsis', maxWidth: '120px'}}>
                                            {bettingOption.title}
                                        </Typography>
                                        
                                    </Box>
                                    <Box sx={{ width: '140px', gap: 0.125, display: 'flex' }}>
                                        {yes_or_no == 1 ? (
                                            <Box sx={{ background: 'rgba(39, 174, 96, 0.1)',width: 1, display: 'flex', justifyContent: 'left', overflow: 'hidden' }}>
                                                <Typography sx={{padding: '5px', whiteSpace: 'nowrap'}}>Resolved: Yes</Typography>
                                            </Box>
                                        ) : (
                                            <Box sx={{ background: 'rgba(235, 87, 87, 0.1)',width: 1, display: 'flex', justifyContent: 'left', overflow: 'hidden' }}>
                                                <Typography sx={{padding: '5px', whiteSpace: 'nowrap'}}>Resolved: No</Typography>
                                            </Box>
                                        )}
                                    </Box>
                                </Box>
                            ) 
                        })}
                    </Box>
                )
            }
        }
    };
  
    return (
        <Link to={`/event/${event.ipfsUrl}`} style={{textDecoration: 'none'}}>
            <Card sx={{ height: 200, p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',  "&:hover": { boxShadow: 8 } }}>
                <Box sx={{ display: 'flex', mb: 3}}>
                    <CardMedia
                        sx={{ height: 72, width:72, minWidth: 72 }}
                        image={`https://gateway.pinata.cloud/ipfs/${event.image}`}
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