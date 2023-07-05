import axios, { AxiosError, AxiosResponse } from 'axios';
import { getSession, signOut } from 'next-auth/react';

export const APP_GAME_UID = '90bd85cd-2035-43c0-a090-d5e9e372ece8';

export const API_URL = 'https://megafans-admin-api-dev.azurewebsites.net';

const api = axios.create({
    baseURL: `${API_URL}/api`,
    timeout: 180000,
    headers: {
        'Content-Type': 'application/json'
    },
    params: {
        appGameUid: APP_GAME_UID
    }
});

api.interceptors.request.use(async (config) => {
    try {
        const session = await getSession();
        // @ts-ignore
        const token = session?.accessToken;

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    } catch (e) {
        console.log('ERROR fetching getSession');
    }

    return config;
});

api.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
        // const originalRequest = error.config;
        // Unauthorized status response

        const session = await getSession();

        // TODO refresh token flow
        if (error.response?.status === 401 && session?.user) {
            await signOut();
        }
        // @ts-ignore
        // const refreshToken = session?.user?.refresh;

        // @ts-ignore
        // eslint-disable-next-line no-underscore-dangle
        // if (error.response?.status === 401 && !originalRequest?._retry) {
        //     // @ts-ignore
        //     // eslint-disable-next-line no-underscore-dangle
        //     originalRequest._retry = true;
        //     // const newToken = await store.dispatch(refresh());

        //     if (!newToken) {
        //         return Promise.reject(error);
        //     }
        //     // eslint-disable-next-line @typescript-eslint/dot-notation
        //     axios.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        //     // return newInstance.instance(originalRequest);
        //     return api(originalRequest);
        // }
        return Promise.reject(error);
    }
);

export { api };
