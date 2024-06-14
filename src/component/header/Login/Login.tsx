import { Box, Button, Modal, TextField, Typography } from "@mui/material"
import { useEffect, useState } from "react";
import { useAccount, useConnect, useDisconnect, useSignMessage } from "wagmi";
import "./Login.scss"
import { Auth } from "../../../types";

interface Props {
	handleLoggedIn: (auth: Auth) => void;
}

export function Login({handleLoggedIn}: Props) {
	// need to show login button. 
	// i want to 
	const [open, setOpen] = useState(false);
	const [otpOpen, setOtpOpen] = useState(false);
	const [otp, setOtp] = useState('');
	const handleOpen = () => setOpen(true);
	const handleClose = () => setOpen(false);
	const [email, setEmail] = useState('');
	
	const { signMessageAsync } = useSignMessage()
	const { address, isConnected } = useAccount()
  	const { connectors, connect } = useConnect()
	const { disconnect } = useDisconnect();

	const style = {
		position: 'absolute' as 'absolute',
		top: '50%',
		left: '50%',
		transform: 'translate(-50%, -50%)',
		width: 400,
		bgcolor: 'background.paper',
		border: '2px solid #000',
		boxShadow: 24,
		p: 4,
		display: 'flex',
		flexDirection: 'column',
		gap: '1.5rem'
	};

	const sendOtp = () => {
		fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/email/verify`, {
			body: JSON.stringify({ email, otp }),
			headers: {
				'Content-Type': 'application/json',
			},
			method: 'POST'
		})
		.then((response) => {
			if (response.status != 200) {
				throw new Error('Email verification failed')
			} else {
				return response.json()
			}
			
		})
		.then(handleLoggedIn)
		.catch(err => {
			window.alert(err);
			console.error(err)
		})
		.finally(() => {
			setOtpOpen(false);
		});
	}

	const loginWithEmail = () => {
		// fetch(`${import.meta.env.VITE_BACKEND_URL}/users?publicAddress=${email}`)
		// 	.then((response) => response.json())
		// 	// If yes, retrieve it. If no, create it.
		// 	.then((users) =>
		// 		users.length ? users[0] : handleSignup(email)
		// 	)
		// 	.then(handleSendMail);
		handleClose();

		fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/email/send`, {
			body: JSON.stringify({ email }),
			headers: {
				'Content-Type': 'application/json',
			},
			method: 'POST'
		})
		.then((response) => {
			if (response.status != 200) {
				throw new Error('Email sending failed')
				
			} else {
				// return response.json()
				// show 6 otp digits form
				setOtpOpen(true);
			}
		})
		.catch(err => {
			debugger
			console.error(err)
		});
	}

	const handleAuthenticate = ({
		publicAddress,
		signature,
	}: {
		publicAddress: string;
		signature: `0x${string}`;
	}) =>
		fetch(`${import.meta.env.VITE_BACKEND_URL}/auth`, {
			body: JSON.stringify({ publicAddress, signature }),
			headers: {
				'Content-Type': 'application/json',
			},
			method: 'POST',
		}).then((response) => response.json());

	const handleSignMessage = async ({
		publicAddress,
		nonce,
	}: {
		publicAddress: string;
		nonce: string;
	}) => {
		try {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore because web3 is defined here.
			if (!publicAddress) {
				throw new Error(
					'There is issue: address or chain is missing.'
				);
			} else {
				const message = `I am signing my one-time nonce: ${nonce}`;

				const signature = await signMessageAsync({ message })

				return { publicAddress, signature };
			}
		} catch (err) {
			debugger
			throw new Error(
				'You need to sign the message to be able to log in.'
			);
		}
	};

	const handleSignup = (publicAddress: string) =>
		fetch(`${import.meta.env.VITE_BACKEND_URL}/users`, {
			body: JSON.stringify({ publicAddress }),
			headers: {
				'Content-Type': 'application/json',
			},
			method: 'POST'
		}).then((response) => response.json());

	const [tryLogin, setTryLogin] = useState(false)

	useEffect(() => {
		if (address && isConnected && tryLogin) {
			setTryLogin(false);
			fetch(`${import.meta.env.VITE_BACKEND_URL}/users?publicAddress=${address}`)
			.then((response) => response.json())
			// If yes, retrieve it. If no, create it.
			.then((users) =>
				users.length ? users[0] : handleSignup(address)
			)
			.then(handleSignMessage)
			// Send signature to backend on the /auth route
			.then(handleAuthenticate)
			// Pass accessToken back to parent component (to save it in localStorage)
			.then(handleLoggedIn)
			.catch((err) => {
				window.alert(err);
				debugger
				disconnect();
			});

		}
	}, [address, isConnected, tryLogin])

	return (
		<>
			<Button onClick={handleOpen}>Login</Button>
			<Modal sx={{zIndex: '10 !important'}}
				open={open}
				onClose={handleClose}
				aria-labelledby="modal-modal-title"
				aria-describedby="modal-modal-description"
			>
				<Box sx={style}>
					<Typography id="modal-modal-title" variant="h6" component="h2">
					Login To PLSpeak
					</Typography>
					<Box className="modal-inner-wrapper">
						<Box className="email-login-wrapper">
							<TextField
								id="filled-search"
								label="Email"
								InputLabelProps={{
									shrink: true,
								}}
								onChange={(e) => setEmail(e.target.value)}
								value={email}
							/>
							<Button onClick={loginWithEmail}>Log in with Email</Button>
						</Box>
						<Box className="connectors-container">
						{connectors.map((connector) => {
							if (connector.type == "injected")
								return null
							else
								return (
								<button
									className="connector-button"
									key={connector.uid}
									onClick={() => connect({ connector }, {onSuccess: () => {
										setTryLogin(true);
									}})}
									type="button"
								>
									{connector.name}
								</button>)
						})}
						</Box>
					</Box>
				</Box>
			</Modal>
			<Modal sx={{zIndex: '10 !important'}}
				open={otpOpen}
				onClose={() => setOtpOpen(false)}
				aria-labelledby="modal-modal-title"
				aria-describedby="modal-modal-description"
			>
				<Box sx={style}>
					<TextField
						id="filled-search"
						label="Otp"
						InputLabelProps={{
							shrink: true,
						}}
						onChange={(e) => setOtp(e.target.value)}
						value={otp}
					/>
					<Button onClick={sendOtp}>Send</Button>
				</Box>
			</Modal>
		</>
	)
}
