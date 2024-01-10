import { Box, Button, FormControl, InputAdornment, InputLabel, Modal, OutlinedInput, TextField } from '@mui/material'
import { useLocalStorage } from 'usehooks-ts'
import { JwtDecoded, UserInfo } from '../../types'
import { useEffect, useState } from 'react'
import { jwtDecode } from 'jwt-decode'
import "./Money.scss"

export default function MoneyPage() {
    const [accessToken] = useLocalStorage<string>('accessToken', '')
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const [withdrawAddress, setWithdrawAddress] = useState('')
    const [withdrawAmount, setWithdrawAmount] = useState('0.01')

    const [userInfo, setUserInfo] = useState<UserInfo>({
        id: 0,
		correspondingAddress: '',
		currentMoney: 0
    })

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

    const handleWithdraw = () => {
        fetch(`${import.meta.env.VITE_BACKEND_URL}/users/${userInfo.id}/withdraw`, {
			body: JSON.stringify({ withdrawAddress, withdrawAmount }),
			headers: {
                Authorization: `Bearer ${accessToken}`,
				'Content-Type': 'application/json',
			},
			method: 'POST'
		}).then((response) => response.json());
    }

    useEffect(() => {
        if (accessToken != '') {
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
        }
        
    }, [accessToken])

    return (
      <Box>
        <Box>
            <h1>Deposit</h1>
            <p>Send/withdraw Coast Coin to the address {userInfo.correspondingAddress}</p>
        </Box>
        <Box>
            <h1>Withdraw</h1>
            <Button onClick={handleOpen}>Open modal</Button>
        </Box>

        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <FormControl className='withdraw-form'>
                    <TextField
                        id="filled-search"
                        label="Address"
                        InputLabelProps={{
                            shrink: true,
                        }}
                        onChange={(e) => setWithdrawAddress(e.target.value)}
                        value={withdrawAddress}
                    />
                    <FormControl fullWidth>
                        <InputLabel htmlFor="outlined-adornment-amount">Amount</InputLabel>
                        <OutlinedInput
                            id="outlined-adornment-amount"
                            startAdornment={<InputAdornment position="start">$</InputAdornment>}
                            label="Amount"
                            type="number"
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            value={withdrawAmount}
                        />
                    </FormControl>
                    <Button variant="contained" onClick={handleWithdraw}>Withdraw</Button>
                </FormControl>
            </Box>
        </Modal>
      </Box>
    )
}
