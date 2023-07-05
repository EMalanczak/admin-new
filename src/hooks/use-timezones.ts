import useSWR from 'swr';

import { API_URL, api } from '@lib/api';

type Timezone = {
    id: string;
    difference: string;
    displayName: string;
    standardName: string;
};

type TimezonesResponse = Timezone[];

export function useTimezones() {
    const { data, error } = useSWR(
        `${API_URL}/api/Timezones`,
        async (url: string) => api.get<TimezonesResponse>(url).then((res) => res.data),
        {
            revalidateIfStale: false,
            revalidateOnFocus: false,
            revalidateOnReconnect: false
        }
    );

    return {
        timezones: data ?? [],
        isLoading: !error && !data,
        isError: error
    };
}
