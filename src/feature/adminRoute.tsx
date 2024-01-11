import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../app/store";
import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";

export default function AdminRoute({children}: any) {
    const navigate = useNavigate();
    const isAdmin = useSelector((state: RootState) => state.userKey.isAdmin);
    const [readyToShow, setReadyToShow] = useState(false);

    useEffect(() => {
        if (!isAdmin) {
            setReadyToShow(false);
            navigate('/');
        } else {
            setReadyToShow(true);
        }
    }, [isAdmin]);

    if (readyToShow)
        return children;
    else
        return (
            <Box
                sx={{
                height: "70vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                }}
            >
                <Typography sx={{ fontWeight: 600 }}>
                    Checking your privilege...
                </Typography>
            </Box>
        );
};