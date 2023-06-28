import useSWR from 'swr';

import { API_URL, api } from '@lib/api';

export interface RolesResponse {
    /** @format int64 */
    id: number;
    name: string | null;
}

export function useRoles() {
    const { data, error } = useSWR(
        `${API_URL}/api/Roles`,
        async (url: string) => api.get<RolesResponse[]>(url).then((res) => res.data),
        {
            revalidateIfStale: false,
            revalidateOnFocus: false
        }
    );

    return {
        roles: data,
        isLoading: !error && !data,
        isError: error
    };
}
