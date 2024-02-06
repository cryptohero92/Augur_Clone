import * as React from 'react';
import { Box } from '@mui/material';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Fade from '@mui/material/Fade';
import { BettingStyle } from '../../types';

export default function BettingStyleSelectMenu({bettingStyle, setBettingStyle}) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = (_bettingStyle) => {
    setAnchorEl(null);
    setBettingStyle(_bettingStyle);
  };

  return (
    <Box sx={{padding: '1.5rem', paddingBottom: '0.5rem'}}>
      <Box
        id="fade-button"
        aria-controls={open ? 'fade-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
      >
        {bettingStyle} ⟱
      </Box>
      <Menu
        id="fade-menu"
        MenuListProps={{
          'aria-labelledby': 'fade-button',
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        TransitionComponent={Fade}
      >
        <MenuItem onClick={() => handleClose(BettingStyle.Market)}>Market</MenuItem>
        <MenuItem onClick={() => handleClose(BettingStyle.Limit)}>Limit</MenuItem>
      </Menu>
    </Box>
  );
}
