import { useLocalStorage } from 'usehooks-ts'
import { AccountInfo } from './AccountInfo/AccountInfo'
import { Login } from './Login/Login'
import { Auth } from '../../types'
import { useDisconnect } from 'wagmi'

export default function Header() {
	const { disconnectAsync } = useDisconnect()
	const [accessToken, setAccessToken] = useLocalStorage<string>('accessToken', '')

	const handleLoggedIn = (auth: Auth) => {
		console.log(auth)
		debugger
		const { accessToken } = auth;
		setAccessToken(accessToken);
	};

	const handleLogout = async () => {
		await disconnectAsync();
		setAccessToken('');
	}

	return (
		<div>
			{accessToken != '' ? (
				<AccountInfo handleLogout={handleLogout} />
			) : (
				<Login handleLoggedIn={handleLoggedIn} />
			)}
		</div>
	)
}