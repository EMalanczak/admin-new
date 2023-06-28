import useSWR from 'swr';

import { API_URL, api } from '@lib/api';

export interface User {
    /** @format int64 */
    id: number;
    username?: string | null;
    email: string | null;
    password?: string | null;
    hash: string | null;
    phoneNumber: string | null;
    deviceType: string | null;
    deviceToken?: string | null;
    gender: string | null;

    /** @format date-time */
    dateOfBirth: string | null;

    /** @format double */
    clientBalance: number;
    facebookLoginId: string | null;
    image: string | null;
    phoneVerified: boolean;

    /** @format int64 */
    roleId: number;

    /** @format int64 */
    statusId: number;

    /** @format int32 */
    countryId: number;

    /** @format date-time */
    createdAt: string;

    /** @format date-time */
    modified: string;

    /** @format int32 */
    signupLevel: number | null;
    onesignalId: string | null;
    emailConfirmed: boolean | null;
    banned: boolean | null;
    walletAddress: string | null;
}

export function useRandomUsername() {
    const { data, error, mutate, isValidating, ...swrRest } = useSWR<string>(
        `${API_URL}/api/Users/GenerateUserName`,
        async (url: string) => {
            try {
                const response = await api.get<string>(url);

                return response.data;
            } catch (e) {
                console.error(e);

                return '';
            }
        }
    );

    const refresh = async () => mutate(data);

    return {
        username: data,
        // @ts-ignore
        isLoading: !error && !data,
        isError: error,
        isValidating,
        refresh,
        ...swrRest
    };
}

export function useUser(userId: User['id']) {
    const { data, error, mutate, isValidating, ...swrRest } = useSWR<User | null>(
        `${API_URL}/api/Users/${userId}}`,
        async (url: string) => {
            try {
                const response = await api.get<User>(url);

                return response.data;
            } catch (e) {
                console.error(e);

                return null;
            }
        }
    );

    const refresh = async () => mutate(data);

    return {
        username: data,
        // @ts-ignore
        isLoading: !error && !data,
        isError: error,
        isValidating,
        refresh,
        ...swrRest
    };
}
