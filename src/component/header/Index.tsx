import { useLocalStorage } from 'usehooks-ts'
import { AccountInfo } from './AccountInfo/AccountInfo'
import { Login } from './Login/Login'
import { Auth } from '../../types'
import { useDisconnect } from 'wagmi'

export default function Header() {
	const { disconnectAsync } = useDisconnect()
	const [auth, setAuth] = useLocalStorage<string>('auth', '')

	const handleLoggedIn = (auth: Auth) => {
		console.log(auth)
		setAuth(JSON.stringify(auth));
	};

	const handleLogout = async () => {
		await disconnectAsync();
		setAuth('');
	}

	return (
		<div>
			{auth != '' ? (
				<AccountInfo auth={JSON.parse(auth) as Auth} handleLogout={handleLogout} />
			) : (
				<Login handleLoggedIn={handleLoggedIn} />
			)}
		</div>
	)
}