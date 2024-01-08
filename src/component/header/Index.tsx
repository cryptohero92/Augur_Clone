import { useLocalStorage } from 'usehooks-ts'
import { AccountInfo } from './AccountInfo'
import { Login } from './Login/Login'
import { Auth } from '../../types'

export default function Header() {
	const [auth, setAuth] = useLocalStorage<string>('auth', '')

	const handleLoggedIn = (auth: Auth) => {
		debugger
		console.log(auth)
		setAuth(JSON.stringify(auth));
		// after getting auth, need to save it to localstorage.
	};

	return (
		<div>
			{auth != '' ? (
				<AccountInfo auth={JSON.parse(auth) as Auth} />
			) : (
				<Login handleLoggedIn={handleLoggedIn} />
			)}
		</div>
	)
}