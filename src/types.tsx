import dayjs from 'dayjs'

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

export interface InputState {
    image: string;
    title: string;
    detail: string;
    category: string;
    endDate: dayjs.Dayjs;
    bettingOptions: { title: string; image: string; file: File | null }[];
}

export enum Status {
    INITIAL,
    LOADING,
    HAVERESULT
}

export enum Result {
    SUCCESS,
    FAILURE
}