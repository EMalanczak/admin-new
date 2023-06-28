import { Navbar as MNavbar, ScrollArea, createStyles, rem, Button } from '@mantine/core';
import Image from 'next/image';
import { FaUserFriends, FaUserPlus, FaUsersCog } from 'react-icons/fa';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { IoGameController } from 'react-icons/io5';
import { MdDashboard, MdGames } from 'react-icons/md';
import { RiPlayListAddLine, RiListUnordered } from 'react-icons/ri';
import { TbGoGame, TbTournament } from 'react-icons/tb';

import useLocalStorage from '@hooks/use-local-storage';

import { LinksGroup } from './navbar-links-group';

import logo from '../../../public/images/logo-white.png';

const mockdata = [
    { label: 'Dashboard', icon: MdDashboard, href: '/' },
    {
        label: 'Users',
        icon: FaUserFriends,
        links: [
            { label: 'Users list', link: '/users', icon: FaUsersCog },
            { label: 'Add user', link: '/users/add', icon: FaUserPlus }
        ]
    },
    {
        label: 'Games',
        icon: IoGameController,
        links: [
            { label: 'Games list', link: '/games', icon: TbGoGame },
            { label: 'Add game', link: '/games/add', icon: MdGames }
        ]
    },
    {
        label: 'Tournaments',
        icon: TbTournament,
        links: [
            { label: 'Tournaments list', link: '/tournaments', icon: RiListUnordered },
            { label: 'Add tournament', link: '/tournaments/add', icon: RiPlayListAddLine }
        ]
    }
];

const useStyles = createStyles<string, { collapsed: boolean }>((theme, { collapsed }) => ({
    navbar: {
        // backgroundColor:  theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.white,
        padding: '0px !important',
        backgroundColor: 'transparent',
        width: collapsed ? 62 : 280,
        border: 'none',
        // 40px is layaout py padding
        maxHeight: 'calc(100vh - 40px)'
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
        margin: 'auto',
        width: '100%'
    },

    linksInner: {
        paddingTop: theme.spacing.md,
        paddingBottom: theme.spacing.md
    },

    footer: {
        // marginLeft: `calc(${theme.spacing.md} * -1)`,
        // marginRight: `calc(${theme.spacing.md} * -1)`,
        display: 'flex',
        justifyContent: 'flex-end',
        borderTop: `1px solid ${theme.fn.rgba('#fff', 0.05)}`,
        padding: `8px 16px`
    },

    logo: {
        height: collapsed ? 36 : 64,
        width: 'auto',
        margin: collapsed ? `${rem(16)} auto ${rem(4)} auto` : '0 auto',
        display: 'block',
        objectFit: 'contain'
    }
}));

export const Navbar = () => {
    const [collapsed, setCollapsed] = useLocalStorage('navbar-opened', false);
    const { classes } = useStyles({ collapsed });

    return (
        <MNavbar height="100%" p="md" className={classes.navbar}>
            <MNavbar.Section>
                <Image src={logo} height={64} alt="logo" className={classes.logo} />
            </MNavbar.Section>

            <MNavbar.Section grow className={classes.links} component={ScrollArea}>
                <ScrollArea.Autosize className={classes.linksInner}>
                    {mockdata.map((item) => (
                        <LinksGroup {...item} collapsedMode={collapsed} key={item.label} />
                    ))}
                </ScrollArea.Autosize>
            </MNavbar.Section>

            <MNavbar.Section className={classes.footer}>
                <Button
                    variant="light"
                    compact
                    size="md"
                    onClick={() => {
                        setCollapsed((p) => !p);
                    }}
                >
                    {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
                </Button>
            </MNavbar.Section>
        </MNavbar>
    );
};
