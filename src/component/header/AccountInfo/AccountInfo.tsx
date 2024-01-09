import { jwtDecode } from 'jwt-decode';
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { Auth, UserInfo } from '../../../types';
import { Box, Button, Menu, MenuItem } from '@mui/material';
import { formatUnits } from 'ethers';
import { JwtDecoded } from '../../../types';

interface Props {
	auth: Auth,
	handleLogout: () => void
}

export const AccountInfo = ({auth, handleLogout} : Props) : JSX.Element => {
	const navigate = useNavigate()

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
	
			fetch(`${import.meta.env.VITE_BACKEND_URL}/contract/balance/${correspondingAddress}`)
				.then((response) => response.json())
				.then(({balance, decimals}) => {
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

	const goToMoneyPage = () => {
		handleClose()
		navigate("money")
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
				<MenuItem onClick={goToMoneyPage}>Deposit & Withdraw</MenuItem>
				<MenuItem onClick={onLogout}>Logout</MenuItem>
			</Menu>
		</div>
	)
}