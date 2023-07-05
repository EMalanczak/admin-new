import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { AppProps } from 'next/app';
import Head from 'next/head';
import NextAdapterPages from 'next-query-params/pages';
import { QueryParamProvider } from 'use-query-params';

import { fontMontserrat } from '@constants';

import { SessionProvider } from '../components/auth/session-provider';
import { ProtectedPage } from '../components/layout/protected-page';
import { RouterTransition } from '../components/layout/router-transition';

type AppPropsWithAuth = AppProps & {
    Component: {
        requireAuth?: boolean;
    };
};

const App = ({ Component, pageProps: { session, ...pageProps } }: AppPropsWithAuth) => (
    <>
        <Head>
            <meta charSet="UTF-8" />
            <meta name="viewport" content="width=device-width,initial-scale=1" />
            <title>MegaFans Admin Panel</title>
            <meta name="description" content="" />
            {/* <link rel="canonical" href="https://www.megafans.com/" /> */}
            <meta name="og:locale" content="en_US" />
            <meta name="og:type" content="website" />
            <meta name="og:title" content="" />
            <meta name="og:description" content="" />
            <meta name="og:site_name" content="MegaFans Admin Panel" />
            <meta name="og:image" content="http://localhost:3000/api/og" />
            <link rel="icon" href="/favicon.ico" />
        </Head>

        <SessionProvider session={session}>
            <QueryParamProvider adapter={NextAdapterPages}>
                <MantineProvider
                    withGlobalStyles
                    withNormalizeCSS
                    theme={{
                        colorScheme: 'dark',
                        fontFamily: fontMontserrat.style.fontFamily,
                        breakpoints: {
                            xs: '30em',
                            sm: '48em',
                            md: '60em',
                            lg: '75em',
                            xl: '90em'
                        },

                        globalStyles: (theme) => ({
                            '*, *::before, *::after': {
                                boxSizing: 'border-box'
                            },

                            body: {
                                ...theme.fn.fontStyles(),
                                // TODO add to theme
                                backgroundColor:
                                    theme.colorScheme === 'dark' ? 'rgb(27, 37, 59)' : theme.colors.gray[0],
                                color: theme.colorScheme === 'dark' ? theme.colors.gray[0] : theme.black,
                                lineHeight: theme.lineHeight,
                                overflow: 'hidden'
                            }
                        })
                    }}
                >
                    <ModalsProvider>
                        <Notifications />
                        <RouterTransition />
                        {Component.requireAuth === false ? (
                            <Component {...pageProps} />
                        ) : (
                            <ProtectedPage>
                                <Component {...pageProps} />
                            </ProtectedPage>
                        )}
                    </ModalsProvider>
                </MantineProvider>
            </QueryParamProvider>
        </SessionProvider>
    </>
);

export default App;
