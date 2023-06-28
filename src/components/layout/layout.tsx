import { createStyles } from '@mantine/core';
import { ReactNode } from 'react';

import { Navbar } from './navbar';

type Props = {
    children: ReactNode;
};

export const burgerBreakpoint = 'md';

const useStyles = createStyles((theme) => ({
    container: {
        display: 'grid',
        padding: theme.spacing.lg,
        gridTemplateColumns: 'auto 1fr',
        minHeight: '100vh',
        overflow: 'hidden',

        [theme.fn.smallerThan(burgerBreakpoint)]: {
            gridTemplateColumns: '1fr',
            padding: theme.spacing.xs
        }
    },

    navbar: {
        gridColumn: '1 / 2',

        [theme.fn.smallerThan(burgerBreakpoint)]: {
            display: 'none'
        }
    },

    content: {
        gridColumn: '2 / 3',
        backgroundColor: 'rgb(35, 45, 69)',
        borderRadius: theme.radius.md,
        padding: theme.spacing.md,
        maxHeight: `calc(100vh - ${theme.spacing.lg} * 2)`,
        overflow: 'hidden',

        [theme.fn.smallerThan(burgerBreakpoint)]: {
            gridColumn: '1 / 2',
            padding: theme.spacing.sm,
            maxHeight: `calc(100vh - ${theme.spacing.xs} * 2)`
        }
    }
}));

export const Layout = ({ children }: Props) => {
    const { classes } = useStyles();

    return (
        <div className={classes.container}>
            <div className={classes.navbar}>
                <Navbar />
            </div>

            <main className={classes.content}>{children}</main>
        </div>
    );
};
