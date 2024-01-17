import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { Collapse } from '@mui/material';
import React from 'react';

export default ({title, children}) => {
	const [open, setOpen] = React.useState(false);
	const handleClick = () => {
		setOpen(!open);
	};

	return (
        <>
            <ListItemButton onClick={handleClick}>
                <ListItemText primary={title} />
                {open ? <ExpandLess /> :<ExpandMore />}
            </ListItemButton>
            <Collapse sx={{ pl: 4 }} in={open} timeout="auto" unmountOnExit>
                { children }
            </Collapse>
        </>
	)
}