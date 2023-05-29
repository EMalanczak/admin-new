import { MantineProvider } from '@mantine/core';
import { AppProps } from 'next/app';
import Head from 'next/head';

import { fontMontserrat } from '@constants';

const App = ({ Component, pageProps }: AppProps) => (
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
                primaryColor: 'orange',

                globalStyles: (theme) => ({
                    '*, *::before, *::after': {
                        boxSizing: 'border-box'
                    },

                    body: {
                        ...theme.fn.fontStyles(),
                        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
                        color: theme.colorScheme === 'dark' ? theme.colors.gray[0] : theme.black,
                        lineHeight: theme.lineHeight
                    }
                })
            }}
        >
            <Component {...pageProps} />
        </MantineProvider>
    </>
);

export default App;
