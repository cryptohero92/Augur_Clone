import { jwtDecode } from 'jwt-decode';
import { useState, useEffect } from 'react'
import { Auth } from '../../../types';
import { Box, Button, Menu, MenuItem } from '@mui/material';
import { formatUnits } from 'ethers';

interface Props {
	auth: Auth,
	handleLogout: () => void
}

interface UserInfo {
	id: number;
	correspondingAddress: string;
	currentMoney: number;
}

export const AccountInfo = ({auth, handleLogout} : Props) : JSX.Element => {

	interface JwtDecoded {
		payload: {
			id: string;
			correspondingAddress: string;
		};
	}

	const [userInfo, setUserInfo] = useState<UserInfo>({
		id: 0,
		correspondingAddress: '',
		currentMoney: 0
	});

	let previousToken = '';

	useEffect(() => {
		const { accessToken } = auth

		if ( accessToken != '' && accessToken != previousToken) {
			previousToken = accessToken;
			const {
				payload: {
					id,
					correspondingAddress
				}
			} = jwtDecode<JwtDecoded>(accessToken)
	
			debugger
			fetch(`${import.meta.env.VITE_BACKEND_URL}/contract/balance/${correspondingAddress}`)
				.then((response) => response.json())
				.then(({balance, decimals}) => {
					debugger
					setUserInfo({
						id: Number(id), 
						correspondingAddress,
						currentMoney: Number(formatUnits(balance, Number(decimals)))
					})
				})
				.catch((err) => {
					debugger
					window.alert(err);
				});
		}
	}, [auth]) 

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

	return (
		<div className="Account">
			<Box>
				Balance: ${userInfo.currentMoney}
			</Box>
			<Button
				id="basic-button"
				aria-controls={open ? 'basic-menu' : undefined}
				aria-haspopup="true"
				aria-expanded={open ? 'true' : undefined}
				onClick={handleClick}
			>
				{userInfo.correspondingAddress}
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
				<MenuItem onClick={onLogout}>Logout</MenuItem>
			</Menu>
		</div>
	)
}