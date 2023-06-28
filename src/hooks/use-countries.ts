import useSWR from 'swr';

import { API_URL, api } from '@lib/api';

export interface CountryResponse {
    /** @format int64 */
    id: number;
    name: string;
    countryCode: string;
    flag: string;
}

export function useCountries() {
    const { data, error } = useSWR(
        `${API_URL}/api/Countries`,
        async (url: string) => api.get<CountryResponse[]>(url).then((res) => res.data),
        {
            revalidateIfStale: false,
            revalidateOnFocus: false,
            revalidateOnReconnect: false
        }
    );

    return {
        countries: data,
        isLoading: !error && !data,
        isError: error
    };
}
