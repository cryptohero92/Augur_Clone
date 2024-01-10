export interface Auth {
	accessToken: string;
}

export interface JwtDecoded {
	payload: {
		id: string;
		correspondingAddress: string;
	};
}

export interface UserInfo {
	id: number;
	correspondingAddress: string;
}