import { DialogContent, DialogContentText, DialogActions, Dialog, Box, Typography, Button, CardMedia } from '@mui/material';
import { Link } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import CampaignIcon from '@mui/icons-material/Campaign';
import { useState } from 'react';
import { useLocalStorage } from 'usehooks-ts';

export default function UnPublishedEvent({event, removeEvent}: any) {
    const [open, setOpen] = useState(false);
    const [accessToken] = useLocalStorage<string>('accessToken', '')

    const openDialog = () => {
        setOpen(true);
    };
    
    const handleClose = () => {
        setOpen(false);
    };
    
    const confirmDelete = () => {
        // dispatch(removeEvent({id: event._id}));
        setOpen(false);
        fetch(`${import.meta.env.VITE_BACKEND_URL}/events/${event._id}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
				'Content-Type': 'application/json',
			},
            method: 'DELETE'
        }).then((response) => {
            response.json()
            removeEvent(event._id)
        })
        .catch((err) => {
            console.error(err);
        });
    };

    const [openPublish, setOpenPublish] = useState(false);

    const openPublishDialog = () => {
        setOpenPublish(true);
    }

    const handleClosePublish = () => {
        setOpenPublish(false);
    }

    const confirmPublish = () => {
        // dispatch(publishEvent({id: event._id}));
        setOpenPublish(false);
        fetch(`${import.meta.env.VITE_BACKEND_URL}/events/publish`, {
            body: JSON.stringify({id: event._id}),
            headers: {
                Authorization: `Bearer ${accessToken}`,
				'Content-Type': 'application/json',
			},
            method: 'POST'
        }).then((response) => {
            debugger
            if (response.status != 200) {
                throw new Error('publish failed')
                
            } else {
                confirmDelete();
            }
        })
        .catch(err => {
            console.error(err);
        });
    }

    return (
        <Box>
            <CardMedia
                sx={{ height: 80, width:80, minWidth: 80, ml: '1rem' }}
                image={event.image}
            />
            <Box sx={{ p: 0.6, ml: 0.5 }}>
                <Typography sx={{ color: 'lightgray', fontSize: 12}}>
                    {event.category}
                </Typography>
                <Typography>
                    {event.title}
                </Typography>
            </Box>
            <Link to={`/dashboard/update/${event._id}`}>
                <EditIcon>edit</EditIcon>
            </Link>
            <DeleteForeverIcon onClick={() => openDialog()}>
                delete
            </DeleteForeverIcon>
            <CampaignIcon onClick={() => openPublishDialog()}>
                Publish
            </CampaignIcon>
            {open && (
                <Dialog
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="Delete Event"
                >
                    <DialogContent style={{ width: 300 }}>
                        <DialogContentText>Are you sure?</DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button autoFocus onClick={handleClose} color="primary">
                        Cancel
                        </Button>
                        <Button onClick={confirmDelete} color="primary" autoFocus>
                        Delete
                        </Button>
                    </DialogActions>
                </Dialog>
            )}

            {openPublish && (
                <Dialog
                    open={openPublish}
                    onClose={handleClosePublish}
                    aria-labelledby="Publish Event"
                >
                    <DialogContent style={{ width: 300 }}>
                        <DialogContentText>Are you sure?</DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button autoFocus onClick={handleClosePublish} color="primary">
                        Cancel
                        </Button>
                        <Button onClick={confirmPublish} color="primary" autoFocus>
                        Publish
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </Box>
        
    )
}