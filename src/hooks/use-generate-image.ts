import useSWR from 'swr';

import { API_URL, api } from '@lib/api';

export function useGenerateImage() {
    const { data, error, mutate } = useSWR(
        `${API_URL}/api/Image/GenerateRandomProfileImage`,
        async (url: string) => api.get(url).then((res) => res.data),
        {
            revalidateIfStale: false,
            revalidateOnFocus: false,
            revalidateOnReconnect: false
        }
    );

    return {
        image: data,
        isLoading: !error && !data,
        isError: error,
        refresh: async () => mutate(data)
    };
}
