import { jwtDecode } from 'jwt-decode';
import { useState, useEffect } from 'react'
import { Auth } from '../../types';

interface Props {
	auth: Auth
}

interface State {
	userinfo?: {
		id: number;
		correspondingAddress: string;
		currentMoney: number;
	}
}

export const AccountInfo = ({auth} : Props) : JSX.Element => {

	interface JwtDecoded {
		payload: {
			id: string;
			publicAddress: string;
		};
	}

	const [state, setState] = useState<State>({
		userinfo: undefined
	});

	useEffect(() => {
		const { accessToken } = auth
		const {
			payload: {id}
		} = jwtDecode<JwtDecoded>(accessToken)

		fetch(`${import.meta.env.VITE_BACKEND_URL}/userinfo/${id}`, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		})
			.then(response => response.json())
			.then(userinfo => setState((state) => ({...state, userinfo})))
			.catch(err => window.alert(err))
	}, [auth]) 

	return (
		<div className="Account">
			state.userinfo?.correspondingAddress
		</div>
	)
}