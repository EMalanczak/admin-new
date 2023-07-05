export type TournamentDto = {
    appGameId: number;
    tournamentName: string;
    tournamentImage: string;
    payout: number;
    cashTournament: boolean;
    startDate: Date;
    endDate: Date;
    gapBetweenTournament: number;
    entryFee: number;
    active: boolean;
    freeEntries: number;
    platformId: number;
    prioritySequence: number;
    password: string;
    payoutId: number;
    duration?: number;
    bots: boolean;
    payoutDescription: string;
    metaData: string;
    weekendTournament: boolean;
    weekdayOnly: boolean;
    gapBetween: number;
    createdAt?: string;
    modified?: string;
    timezoneId: string;
};

export type PayoutDto = {
    name: string;
    id?: number;
    createdAt?: string;
    modified?: string;
};
