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

export interface PublishedEventInfo {
    ipfsUrl: string,
    resolved: boolean,
    title: string,
    detail: string,
    image: string,
    category: string,
    endDate: string,
    comments: {
        content: string,
        writer: `0x${string}`
    }[],
    bettingOptions: {
        title: string,
        image: string,
        bet: number,
    }[]
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

export interface Category {
    name: string;
    subcategories: string[];
}

export interface CategoryState {
    keywords: Category[];
    activeList: string[];
}