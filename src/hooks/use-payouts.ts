import useSWR from 'swr';

import { API_URL, api } from '@lib/api';

export type Payout = {
    id: number;
    name: string;
};

export type PayoutsResponse = Payout[];

export function usePayouts() {
    const { data, error, mutate } = useSWR(
        `${API_URL}/api/Payouts`,
        async (url: string) => api.get<PayoutsResponse>(url).then((res) => res.data),
        {
            revalidateIfStale: false,
            revalidateOnFocus: false,
            revalidateOnReconnect: false
        }
    );

    return {
        payouts: data
            ? data.map((payout) => ({
                  id: payout.id,
                  value: `${payout.id}`,
                  label: payout.name
              }))
            : [],
        isLoading: !error && !data,
        isError: error,
        mutate
    };
}

type PayoutDetails = {
    id: number;
    payoutId: number;
    position: number;
    percentage: number;
    prize: string;
    imageUri: string;
    nftId: string;
};
type PayoutsByPayoutIdResponse = PayoutDetails[];

export function usePayoutDetails(payoutId?: number) {
    const { data, error, mutate } = useSWR(
        payoutId ? `${API_URL}/api/PayoutDetails/PayoutsByPayoutId?payoutId=${payoutId}` : null,
        async (url: string) => api.get<PayoutsByPayoutIdResponse>(url).then((res) => res.data)
    );

    return {
        details: data ?? [],
        isLoading: !error && !data,
        isError: error,
        mutate
    };
}
