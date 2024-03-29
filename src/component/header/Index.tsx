import { useLocalStorage } from 'usehooks-ts'
import { AccountInfo } from './AccountInfo/AccountInfo'
import { Login } from './Login/Login'
import { Auth } from '../../types'
import { useDisconnect } from 'wagmi'
import { AppBar, Box, Button, Container, Menu, MenuItem, Toolbar, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import logo from "../../assets/logo.png"
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux'
import { RootState } from '../../app/store'

export default function Header() {
	const { disconnectAsync } = useDisconnect()
	const [accessToken, setAccessToken] = useLocalStorage<string>('accessToken', '')
	const isAdmin = useSelector((state: RootState) => state.userKey.isAdmin)

	const navigate = useNavigate()

	const handleLoggedIn = (auth: Auth) => {
		console.log(auth)
		const { accessToken } = auth;
		setAccessToken(accessToken);
	};

	const handleLogout = async () => {
		await disconnectAsync();
		setAccessToken('');
	}

	const [anchorElNav, setAnchorElNav] = useState(null);
	const [pages, setPages] = useState(['Markets', 'Activity', 'Learn', 'LeaderBoard']);

	const handleOpenNavMenu = (event: any) => {
		setAnchorElNav(event.currentTarget);
	};

	const handleCloseNavMenu = () => {
		setAnchorElNav(null);
	};

	useEffect(() => {
		if (isAdmin) {
			const exists = pages.includes('Dashboard');
			if (!exists) {
				setPages([...pages, 'Dashboard']);
			}
		} else {
			setPages(pages.filter(page => page != 'Dashboard'))
		}
	}, [isAdmin])

	return (
		<AppBar position="static" sx={{ backgroundColor: 'yellowgreen' }}>
			<Container>
				<Toolbar disableGutters>
				<Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
					<Typography
					variant="h6"
					noWrap
					component="div"
					sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}
					>
					<Box
						onClick={handleOpenNavMenu}
						pl={{ xs: 0, md: 0 }}
						component="img"
						sx={{
						height: "60px",
						width: "200px",
						}}
						alt="The house from the offer."
						src={logo}
					/>
					</Typography>
					<Menu
						id="menu-appbar"
						anchorEl={anchorElNav}
						anchorOrigin={{
							vertical: 'bottom',
							horizontal: 'left',
						}}
						keepMounted
						transformOrigin={{
							vertical: 'top',
							horizontal: 'left',
						}}
						open={Boolean(anchorElNav)}
						onClose={handleCloseNavMenu}
						sx={{
							display: { xs: 'block', md: 'none' },
						}}
					>
					<MenuItem key="home" onClick={() => {navigate("/");handleCloseNavMenu()}}>
						<Typography textAlign="center">Home</Typography>
					</MenuItem>
					{pages.map((page) => (
						<MenuItem key={page} onClick={() => {navigate(page);handleCloseNavMenu()}}>
						<Typography textAlign="center">{page}</Typography>
						</MenuItem>
					))}
					</Menu>
				</Box>

				<Typography
					variant="h6"
					noWrap
					component="div"
					sx={{ mr: 2, display: { xs: "none", md: "flex" } }}
				>
					<Box
						onClick={() => navigate("/")}
						pl={{ xs: 10, md: 0 }}
						component="img"
						sx={{
							height: "60px",
							width: "200px",
							py: "20px",
							cursor: "pointer",
						}}
						alt="The house from the offer."
						src={logo}
					/>
				</Typography>
				<Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
					{pages.map((page) => (
					<Button
						key={page}
						onClick={() => navigate(page)}
						sx={{ my: 2, color: 'white', display: 'block' }}
					>
						{page}
					</Button>
					))}
				</Box>

				<Box sx={{ flexGrow: 0 }}>
					{accessToken != undefined && accessToken != '' ? (
						<AccountInfo handleLogout={handleLogout} />
					) : (
						<Login handleLoggedIn={handleLoggedIn} />
					)}
				</Box>
				</Toolbar>
			</Container>
			</AppBar>
	)
}