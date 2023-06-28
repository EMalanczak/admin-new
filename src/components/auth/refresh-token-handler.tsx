import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

// https://dev.to/mabaranowski/nextjs-authentication-jwt-refresh-token-rotation-with-nextauthjs-5696
export const RefreshTokenHandler = ({ setInterval }: any) => {
    const { data: session } = useSession();

    useEffect(() => {
        if (session) {
            // We did set the token to be ready to refresh after 23 hours, here we set interval of 23 hours 30 minutes.
            // @ts-ignore
            const timeRemaining = Math.round((session.accessTokenExpiry - 30 * 60 * 1000 - Date.now()) / 1000);
            setInterval(timeRemaining > 0 ? timeRemaining : 0);
        }
    }, [session]);

    return null;
};
