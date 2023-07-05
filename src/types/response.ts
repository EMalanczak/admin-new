export type PayoutResponse = {
    id: number;
    name: string;
    createdAt: Date;
    modifiedAt: Date;
};

export type PayoutDetail = {
    id: number;
    payoutId: number;
    position: number;
    percentage: number;
    createdAt: string;
    modified: string;
    prize?: string;
    imageUri?: string;
    nftId?: string;
};

export type PayoutDetailsResponse = PayoutDetail[];
