import { useDispatch } from "react-redux";
import { useEffect, useState } from 'react';
import { Box, Button, Grid, Typography } from '@mui/material'
import { Link } from 'react-router-dom';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import UnPublishedEvent from "../../component/Event/UnPublishedEvent";
import { updatePublishedEvent } from "../../feature/slices/eventSlice";
import { PublishedEventInfo } from "../../types";
import { getBettingOptionsPromise } from "../../app/constant";

export default function Categories() {
    // first need to get all events. these events are from mongodb.
    const dispatch = useDispatch();

    return (
        <Box>
            <Box sx={{p: 2, width: 1}}>
                <Link to="/dashboard/events">
                    <Button
                    variant="contained"
                    color="primary"
                    >
                        Events
                    </Button>
                </Link>
            </Box>
            <Box
                sx={{ flexGrow: 1 }}
            >
                Categories
            </Box>
        </Box>
    )
}
