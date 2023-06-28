export type User = {
    /** @format int64 */
    id: number;
    username: string;
    email: string;
    password: string;
    hash: string;
    phoneNumber?: string | null;
    deviceType?: string | null;
    deviceToken?: string | null;
    gender?: string | null;

    /** @format date-time */
    dateOfBirth?: string | null;

    /** @format double */
    clientBalance?: number;
    facebookLoginId?: string | null;
    image?: string | null;
    phoneVerified?: boolean;

    /** @format int64 */
    roleId?: number;

    /** @format int64 */
    statusId?: number;

    /** @format int32 */
    countryId?: number;

    /** @format date-time */
    createdAt?: string;

    /** @format date-time */
    modified?: Date;

    /** @format int32 */
    signupLevel?: number | null;
    onesignalId?: string | null;
    emailConfirmed?: boolean | null;
    banned?: boolean | null;
    walletAddress?: string | null;
};

export interface UserListPagedResponse {
    data: User[] | null;
    succeeded: boolean;
    errors: string[] | null;
    message: string | null;

    /** @format int32 */
    pageNumber: number;

    /** @format int32 */
    pageSize: number;

    /** @format uri */
    firstPage: string | null;

    /** @format uri */
    lastPage: string | null;

    /** @format int32 */
    totalPages: number;

    /** @format int32 */
    totalRecords: number;

    /** @format uri */
    nextPage: string | null;

    /** @format uri */
    previousPage: string | null;
}
