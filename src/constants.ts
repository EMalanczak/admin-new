import { Montserrat } from 'next/font/google';
import localFont from 'next/font/local';

export const LOCAL_STORAGE_KEYS = {
    THEME: 'theme'
};

export const fontMontserrat = Montserrat({ subsets: ['latin'] });

export const fontSquare721 = localFont({
    src: [
        {
            path: '../public/fonts/square_721.woff2',
            weight: '400',
            style: 'normal'
        },
        {
            path: '../public/fonts/square_721.woff',
            weight: '400',
            style: 'normal'
        },
        {
            path: '../public/fonts/square_721.ttf',
            weight: '400',
            style: 'normal'
        }
    ]
});

export const fontGothamThin = localFont({
    src: [
        {
            path: '../public/fonts/gotham-thin.otf',
            style: 'normal'
        }
    ]
});

export const fontHorizon = localFont({
    src: [
        {
            path: '../public/fonts/horizon.otf',
            style: 'normal'
        },
        {
            path: '../public/fonts/horizon-italic.otf',
            style: 'italic'
        }
    ]
});

export const fontOverpass = localFont({
    src: [
        {
            path: '../public/fonts/overpass-regular.woff2',
            weight: '400',
            style: 'normal'
        },
        {
            path: '../public/fonts/overpass-regular.woff',
            weight: '400',
            style: 'normal'
        },
        {
            path: '../public/fonts/overpass-regular.ttf',
            weight: '400',
            style: 'normal'
        }
    ]
});
