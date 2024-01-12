export interface Auth {
	accessToken: string;
}

export interface JwtDecoded {
	payload: {
		id: string;
		correspondingAddress: string;
		isAdmin: boolean;
	};
}

export interface UserInfo {
	id: string;
	correspondingAddress: string;
	isAdmin: boolean;
}