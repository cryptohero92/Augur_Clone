import { Box, Button, Modal, Typography } from "@mui/material"
import { useState } from "react";
import { useConnect } from "wagmi";
import "./Login.scss"
import zIndex from "@mui/material/styles/zIndex";

export function Login() {
	// need to show login button. 
	// i want to 
	const [open, setOpen] = useState(false);
	const handleOpen = () => setOpen(true);
	const handleClose = () => setOpen(false);

  	const { connectors, connect } = useConnect()

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
	};

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
				<Box className="connectors-container">
				{connectors.map((connector) => {
					if (connector.type == "injected")
						return null
					else
						return (
						<button
							className="connector-button"
							key={connector.uid}
							onClick={() => connect({ connector })}
							type="button"
						>
							{connector.name}
						</button>)
				})}
				</Box>
			</Box>
			</Modal>
		</>
	)
}
