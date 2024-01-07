import { useLocalStorage } from 'usehooks-ts'
import { AccountInfo } from './AccountInfo'
import { Login } from './Login'
import { Auth } from '../../types'

export default function Header() {
	const [auth] = useLocalStorage('auth', undefined)

	return (
		<div>
			{auth ? (
				<AccountInfo auth={auth as Auth} />
			) : (
				<Login />
			)}
		</div>
	)
}