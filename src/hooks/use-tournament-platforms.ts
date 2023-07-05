import useSWR from 'swr';

import { API_URL, api } from '@lib/api';

export interface RolesResponse {
    /** @format int64 */
    id: number;
    name: string | null;
}

export function useTournamentPlatforms() {
    const { data, error } = useSWR(
        `${API_URL}/api/Tournaments/platforms`,
        async (url: string) => api.get<any[]>(url).then((res) => res.data),
        {
            revalidateIfStale: false,
            revalidateOnFocus: false
        }
    );

    return {
        platforms: data
            ? data.map((platform) => ({
                  value: platform.id,
                  label: platform.name
              }))
            : [],
        isLoading: !error && !data,
        isError: error
    };
}
