'use client';

import { SessionProvider as SSessionProvider } from 'next-auth/react';
import { ReactNode, useState } from 'react';

import { RefreshTokenHandler } from './refresh-token-handler';

type Props = {
    children: ReactNode;
    session: any;
};

export const SessionProvider = ({ children, session }: Props) => {
    const [interval, setInterval] = useState(0);

    return (
        <SSessionProvider refetchInterval={interval} session={session}>
            {children}
            <RefreshTokenHandler setInterval={setInterval} />
        </SSessionProvider>
    );
};
