import { Box, ScrollArea, UnstyledButton, createStyles, rem } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { IoBodyOutline } from 'react-icons/io5';
import { useSpring, animated } from 'react-spring';

import { useEventListener } from '@hooks/use-event-listener';
import useLocalStorage from '@hooks/use-local-storage';

import { LinksGroup } from './navbar-links-group';

import logo from '../../../public/images/logo-white.png';

export const LAYOUT_GAP = 16;

export const SIDEBAR_PADDING = 0;
export const SIDEBAR_SCROLL_SIZE = 8;
export const SIBEBAR_TOTAL_WIDTH = 230;
export const SIDEBAR_CONTENT_WIDTH = SIBEBAR_TOTAL_WIDTH - 2 * SIDEBAR_PADDING;
export const SIDEBAR_CONTENT_WITHOUT_SCROLL = SIDEBAR_CONTENT_WIDTH - SIDEBAR_SCROLL_SIZE;
export const SIDEBAR_COLLAPSED_PADDING = 4;
export const SIDEBAR_COLLAPSED_WIDTH = 40;
const BUTTON_WIDTH_COLLAPSED = 30;
export const SIDEBAR_COLLAPSED_CONTENT_WIDTH = BUTTON_WIDTH_COLLAPSED;
export const SIDEBAR_COLLAPSED_CONTENT_WITHOUT_SCROLL = SIDEBAR_COLLAPSED_CONTENT_WIDTH - SIDEBAR_SCROLL_SIZE;

export const SIBEBAR_TOTAL_WIDTH_WIDE = 275;
export const SIDEBAR_CONTENT_WIDTH_WIDE = SIBEBAR_TOTAL_WIDTH_WIDE - 2 * SIDEBAR_PADDING;
export const SIDEBAR_CONTENT_WITHOUT_SCROLL_WIDE = SIDEBAR_CONTENT_WIDTH_WIDE - SIDEBAR_SCROLL_SIZE;

const MINIMUM_UNCOLLAPSED_WIDTH = 120;
const MAXIMUM_COLLAPSED_WIDTH = 380;

const mockdata = [
    { label: 'Dashboard', icon: IoBodyOutline, href: '/' },
    {
        label: 'Market news',
        icon: IoBodyOutline,
        initiallyOpened: true,
        links: [
            { label: 'Overview', link: '/' },
            { label: 'Forecasts', link: '/' },
            { label: 'Outlook', link: '/' },
            { label: 'Real time', link: '/' }
        ]
    },
    {
        label: 'Releases',
        icon: IoBodyOutline,
        links: [
            { label: 'Upcoming releases', link: '/a' },
            { label: 'Previous releases', link: '/contracts' },
            { label: 'Releases schedule', link: '/c' }
        ]
    },
    { label: 'Analytics', icon: IoBodyOutline, href: '/analytics' },
    { label: 'Contracts', icon: IoBodyOutline, href: '/contracts' },
    { label: 'Settings', icon: IoBodyOutline, href: '/test/321421' },
    {
        label: 'Security',
        icon: IoBodyOutline,
        links: [
            { label: 'Enable 2FA', link: '/' },
            { label: 'Change password', link: '/' },
            { label: 'Recovery codes', link: '/' }
        ]
    }
];

const useStyles = createStyles((theme) => ({
    navbar: {
        // backgroundColor:  theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.white,
        backgroundColor: 'transparent',
        position: 'relative',
        height: '100%',
        zIndex: 1000,
        // width: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '0 1rem 0 0'
    },

    header: {
        padding: theme.spacing.md,
        paddingTop: 0,
        marginLeft: `calc(${theme.spacing.md} * -1)`,
        marginRight: `calc(${theme.spacing.md} * -1)`,
        color: theme.colorScheme === 'dark' ? theme.white : theme.black,
        borderBottom: `${rem(1)} solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}`,
        display: 'flex',
        justifyContent: 'center'
    },

    links: {
        marginLeft: `calc(${theme.spacing.md} * -1)`,
        marginRight: `calc(${theme.spacing.md} * -1)`
    },

    linksInner: {
        paddingTop: theme.spacing.xl,
        paddingBottom: theme.spacing.xl
    },

    footer: {
        marginLeft: `calc(${theme.spacing.md} * -1)`,
        marginRight: `calc(${theme.spacing.md} * -1)`,
        borderTop: `${rem(1)} solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}`
    },

    logo: {
        height: 64,

        [theme.fn.smallerThan('sm')]: {
            height: 48
        }
    }
}));

export const Sidebar = () => {
    const [collapsed, setCollapsed] = useLocalStorage('navbar-opened', false);
    const isWideSize = useMediaQuery('(min-width: 1000px)');

    const sidebarTotalWidth = isWideSize ? SIBEBAR_TOTAL_WIDTH_WIDE : SIBEBAR_TOTAL_WIDTH;
    const [localSidebarSize, saveLocalSidebarSize] = useLocalStorage<any>('sidebar-size', sidebarTotalWidth);
    const [isResizing, setIsResizing] = useState(false);
    const sidebarRef = useRef<HTMLDivElement>(null);

    const [{ width }, spring] = useSpring(() => ({
        width: collapsed ? SIDEBAR_COLLAPSED_WIDTH : localSidebarSize,
        config: {}
    }));

    const { classes } = useStyles();
    const links = mockdata.map((item) => <LinksGroup collapsedMode={collapsed} {...item} key={item.label} />);

    const resize = useCallback(
        (mouseMoveEvent: any) => {
            if (isResizing) {
                const newWidth = mouseMoveEvent.clientX - sidebarRef.current!.getBoundingClientRect().left ?? 0;

                if (newWidth >= MAXIMUM_COLLAPSED_WIDTH) {
                    return;
                }

                if (newWidth > MINIMUM_UNCOLLAPSED_WIDTH) {
                    // setCollapsed(false);

                    spring.start({
                        width: newWidth,
                        onRest: () => {
                            saveLocalSidebarSize(newWidth);
                        }
                    });
                }

                // NOTE: This is disabled - responsible for collapsing the sidebar when the width is too small
                // if (newWidth < MINIMUM_UNCOLLAPSED_WIDTH) {
                //     setCollapsed(true);

                //     spring.start({
                //         width: SIDEBAR_COLLAPSED_WIDTH,
                //         onRest: () => {
                //             saveLocalSidebarSize(SIDEBAR_COLLAPSED_WIDTH);
                //         }
                //     });
                // }
            }
        },
        [isResizing, spring, saveLocalSidebarSize, setCollapsed]
    );

    const startResizing = useCallback(() => {
        setIsResizing(true);
    }, []);

    const stopResizing = useCallback(() => {
        setIsResizing(false);
    }, []);

    useEventListener('mousemove', resize);
    useEventListener('mouseup', stopResizing);

    useEffect(() => {
        if (!isResizing) {
            spring.start({
                width: collapsed ? SIDEBAR_COLLAPSED_WIDTH : localSidebarSize
            });
        }
    }, [collapsed]);

    return (
        <animated.nav
            style={{
                width
            }}
            data-test-id="sidebar"
            className={classes.navbar}
            ref={sidebarRef}
        >
            <Box
                sx={(theme) => ({
                    // backgroundColor: theme.other.color({
                    //     dark: theme.colors.dark[7],
                    //     light: theme.colors.gray[1]
                    // }),
                    '--background-color': theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[1],
                    '--background-shade': theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
                    '--accent-color': theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.white,
                    '--shade-color': theme.fn.rgba(
                        theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
                        1
                    ),
                    '--first-step': '60px',
                    '--second-step': '100px',
                    color: '#ffffff',
                    height: '100%',
                    minHeight: 650,
                    padding: '6px 0',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 1,
                    gap: 0
                })}
            >
                <Image src={logo} height={64} alt="logo" className={classes.logo} />

                <ScrollArea
                    scrollbarSize={SIDEBAR_SCROLL_SIZE}
                    type={collapsed ? 'hover' : 'auto'}
                    style={{ flex: 1 }}
                    styles={(theme) => ({
                        scrollbar: {
                            // hide X axis scroll
                            // caused by animating text inside button
                            '&[data-orientation="horizontal"]': {
                                display: 'none'
                            },
                            '&:hover': {
                                backgroundColor: 'transparent'
                            }
                        },
                        thumb: {
                            backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[3] : theme.colors.dark[1]
                        },
                        viewport: {
                            '& > div': {
                                display: 'flex !important',
                                flexDirection: 'column',

                                '& > div': {
                                    display: 'flex',
                                    flexDirection: 'column',
                                    width: '100%',
                                    alignItems: 'start'
                                }
                            }
                        }
                    })}
                >
                    {links}
                </ScrollArea>
            </Box>
            <UnstyledButton
                onMouseDown={startResizing}
                sx={(theme) => ({
                    position: 'absolute',
                    width: LAYOUT_GAP * 2,
                    height: '100%',
                    top: 0,
                    right: -LAYOUT_GAP,
                    cursor: 'ew-resize',
                    zIndex: 100,
                    transition: 'background 0.2s ease-in-out',

                    '&:hover': {
                        background: theme.primaryColor,
                        transitionDelay: '0.25s'
                    }
                })}
            />
        </animated.nav>
    );
};
