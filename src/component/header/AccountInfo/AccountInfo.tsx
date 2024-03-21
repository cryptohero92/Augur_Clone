import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { Box, Button, Menu, MenuItem } from '@mui/material';
import { useLocalStorage } from 'usehooks-ts';
import { RootState } from '../../../app/store';
import { useSelector } from 'react-redux';
import { roundToTwo } from '../../../app/constant';

interface Props {
	handleLogout: () => void
}

export const AccountInfo = ({handleLogout} : Props) : JSX.Element => {
	const navigate = useNavigate()
	const { correspondingAddress } = useSelector((state: RootState) => state.userKey);
	
	const [currentMoney] = useLocalStorage<number>('currentMoney', 0)

	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);
	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};
	const handleClose = () => {
		setAnchorEl(null);
	};
	const onLogout = () => {
		handleClose()
		handleLogout()
	}

	const goToMoneyPage = () => {
		handleClose()
		navigate("money")
	}

	return (
		<div className="Account">
			<Box>
				Balance: ${roundToTwo(currentMoney)}
			</Box>
			<Button
				id="basic-button"
				aria-controls={open ? 'basic-menu' : undefined}
				aria-haspopup="true"
				aria-expanded={open ? 'true' : undefined}
				onClick={handleClick}
			>
				{correspondingAddress}
			</Button>
			<Menu
				id="basic-menu"
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
				MenuListProps={{
				'aria-labelledby': 'basic-button',
				}}
			>
				<MenuItem onClick={goToMoneyPage}>Deposit & Withdraw</MenuItem>
				<MenuItem onClick={onLogout}>Logout</MenuItem>
			</Menu>
		</div>
	)
}