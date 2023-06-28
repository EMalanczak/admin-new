import { Group, Box, Collapse, ThemeIcon, Text, UnstyledButton, createStyles, rem, Tooltip } from '@mantine/core';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { FiChevronRight, FiChevronLeft } from 'react-icons/fi';

import useLocalStorage from '@hooks/use-local-storage';

const useStyles = createStyles<string, { collapsedMode: boolean }>((theme, { collapsedMode }) => ({
    control: {
        fontWeight: 500,
        display: 'block',
        width: '100%',
        padding: `${theme.spacing.xs} ${theme.spacing.md}`,
        color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,
        fontSize: theme.fontSizes.sm,
        textDecoration: 'none',
        borderTopLeftRadius: theme.radius.md,
        borderBottomLeftRadius: theme.radius.md,

        '&:hover': {
            backgroundColor: '#25304B',
            color: theme.colorScheme === 'dark' ? theme.white : theme.black
        },

        '& a': {
            textDecoration: 'none',

            '&:visited': {
                color: 'inherit'
            }
        }
    },

    controlWithLinks: {
        borderBottomLeftRadius: '0'
    },

    controlOpened: {
        backgroundColor: collapsedMode ? theme.fn.rgba('#222E4A', 0.9) : 'transparent'
    },

    link: {
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: `${theme.spacing.xs} ${theme.spacing.md}`,
        // paddingLeft: rem(21),
        marginLeft: rem(collapsedMode ? 0 : 30),
        fontSize: theme.fontSizes.sm,
        borderLeft: collapsedMode
            ? 'none'
            : `${rem(1)} solid ${theme.colorScheme === 'dark' ? '#3E405C' : theme.colors.gray[3]}`,
        textDecoration: 'none',
        color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,
        borderTopLeftRadius: collapsedMode ? theme.radius.md : 'none',
        borderBottomLeftRadius: collapsedMode ? theme.radius.md : 'none',

        '&:hover': {
            backgroundColor: '#25304B',
            color: theme.colorScheme === 'dark' ? theme.white : theme.black
        }
    },

    activeLink: {
        backgroundColor: 'rgb(35, 45, 69)',
        color: theme.colorScheme === 'dark' ? theme.white : theme.black
    },
    label: {
        // display: collapsedMode ? 'none' : 'block'
    },
    collapse: {
        backgroundColor: collapsedMode ? theme.fn.rgba('#222E4A', 0.5) : 'transparent',
        borderBottomLeftRadius: theme.radius.md
    }
}));

interface LinksGroupProps {
    icon: React.FC<any>;
    label: string;
    initiallyOpened?: boolean;
    href?: string;
    links?: { label: string; link: string; icon?: React.FC<any> }[];
    collapsedMode: boolean;
}

// 'rgb(35, 45, 69)'
// #25304B
export const LinksGroup = ({
    icon: Icon,
    label,
    initiallyOpened,
    links,
    href = '',
    collapsedMode
}: LinksGroupProps) => {
    const { classes, cx, theme } = useStyles({ collapsedMode });
    const hasLinks = Array.isArray(links);

    // TODO refctor into separate components LinksGroup + LinkItem basing on hasLinks
    const [opened, setOpened] = useLocalStorage(
        `links-${encodeURIComponent(label.toLowerCase())}-opened`,
        initiallyOpened || false
    );
    const [immediateAnimation] = useState(true);

    const ChevronIcon = theme.dir === 'ltr' ? FiChevronRight : FiChevronLeft;

    const { asPath } = useRouter();
    const isActive = asPath === href;

    const items = (hasLinks ? links : []).map(({ icon: NestedIcon, ...link }) => (
        <Tooltip label={link.label} key={link.label} position="right" withinPortal>
            <Link href={link.link} className={cx(classes.link, { [classes.activeLink]: asPath === link.link })}>
                {NestedIcon && (
                    <ThemeIcon variant="subtle" size={30}>
                        <NestedIcon size="1.1rem" />
                    </ThemeIcon>
                )}
                {!collapsedMode && <Text>{link.label}</Text>}
            </Link>
        </Tooltip>
    ));

    useEffect(() => {
        if (hasLinks) {
            const isAnyLinkActive = links.some((link) => link.link === asPath);

            if (isAnyLinkActive) {
                setOpened(true);
            }
        }
    }, []);

    useEffect(() => {
        // setImmediateAnimation(false);
    }, []);

    return (
        <Tooltip.Group closeDelay={0} openDelay={50}>
            <Tooltip label={label} position="right" withinPortal>
                <UnstyledButton<any>
                    {...(hasLinks
                        ? { onClick: () => setOpened((o) => !o) }
                        : {
                              href,
                              component: Link
                          })}
                    className={cx(classes.control, {
                        [classes.activeLink]: isActive,
                        [classes.controlWithLinks]: hasLinks,
                        [classes.controlOpened]: opened
                    })}
                >
                    <Group position="apart" spacing={0}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <ThemeIcon variant="subtle" size={30}>
                                <Icon size="1.1rem" />
                            </ThemeIcon>

                            {!collapsedMode && (
                                <Box ml="md" className={classes.label}>
                                    {label}
                                </Box>
                            )}
                        </Box>

                        {hasLinks && !collapsedMode && (
                            <ChevronIcon
                                size="1rem"
                                style={{
                                    transform: opened ? `rotate(${theme.dir === 'rtl' ? -90 : 90}deg)` : 'none',
                                    transition: `transform ${immediateAnimation ? 0 : 200}ms ease`
                                }}
                            />
                        )}
                    </Group>
                </UnstyledButton>
            </Tooltip>
            {hasLinks && (
                <Collapse in={opened} transitionDuration={immediateAnimation ? 0 : 300} className={classes.collapse}>
                    {items}
                </Collapse>
            )}
        </Tooltip.Group>
    );
};
