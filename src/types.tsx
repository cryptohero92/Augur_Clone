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
    publicAddress: string;
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
    indexInArray: number,
    ipfsUrl: string,
    title: string,
    detail: string,
    image: string,
    category: string,
    endDate: string,
    comments: {
        content: string,
        writer: `0x${string}`
    }[],
    bettingOptions: BettingOptionInfo[]
}

export interface OrderInfo {
    _id: string,
    salt: string,
    maker: string,
    signer: string,
    taker: string,
    tokenId: string,
    makerAmount: number,
    takerAmount: number,
    expiration: number,
    nonce: number,
    feeRateBps: number,
    side: number,
    signatureType: number,
    status: OrderStatus,
    bettingStyle: string
}

export interface OrderRequestInfo {
    selectedBettingOption: BettingOptionInfo,
    bettingStyle: string,
    buyOrSell: boolean,
    yesOrNo: boolean,
    amount: number,
    limitPrice: number,
    shares: number,
    accessToken: string
}

export interface OrderStatus {
    isFilledOrCancelled: boolean,
    remaining: number
}

export interface BettingOptionInfo {
    ipfsUrl: string,
    title: string,
    image: string,
    bet: number,
    result: number
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

export const BettingStyle = {
    Market: 'Market',
    Limit: 'Limit'
};