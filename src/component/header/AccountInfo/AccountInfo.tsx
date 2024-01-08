import { jwtDecode } from 'jwt-decode';
import { useState, useEffect } from 'react'
import { Auth } from '../../../types';
import { Button, Menu, MenuItem } from '@mui/material';

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

	useEffect(() => {
		const { accessToken } = auth
		const {
			payload: {
				id,
				correspondingAddress
			}
		} = jwtDecode<JwtDecoded>(accessToken)

		setUserInfo({
			id: Number(id), 
			correspondingAddress,
			currentMoney: 0
		})
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