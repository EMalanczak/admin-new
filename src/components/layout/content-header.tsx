import { Burger, Drawer, Group, Image, Menu, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useSession, signOut } from 'next-auth/react';
import { ReactNode } from 'react';
import { MdLogout, MdPerson } from 'react-icons/md';

import { burgerBreakpoint } from './layout';
import { Navbar } from './navbar';

type Props = {
    children?: ReactNode;
    label: string;
};

export const ContentHeader = ({ children, label }: Props) => {
    const { data: session } = useSession();

    const [navOpened, { toggle: toggleNav }] = useDisclosure(false);

    return (
        <>
            <Group
                position="apart"
                pb="sm"
                sx={(theme) => ({
                    borderBottom: `1px solid ${theme.fn.rgba('#fff', 0.05)}`
                })}
            >
                <Group>
                    <Burger
                        opened={navOpened}
                        aria-label={navOpened ? 'Close navigation' : 'Open navigation'}
                        onClick={toggleNav}
                        size={18}
                        sx={(theme) => ({
                            display: 'none',

                            [theme.fn.smallerThan(burgerBreakpoint)]: {
                                display: 'block'
                            }
                        })}
                    />
                    <Title order={2}>{label}</Title>
                    {children}
                </Group>

                <Menu shadow="md" width={200} position="bottom-end">
                    <Menu.Target>
                        <Image
                            src={session?.user?.image}
                            height={40}
                            width={40}
                            radius="xl"
                            alt={`user-${session?.user?.name}-avatar`}
                        />
                    </Menu.Target>

                    <Menu.Dropdown>
                        <Menu.Label>{session?.user?.name}</Menu.Label>
                        <Menu.Divider />

                        <Menu.Item icon={<MdPerson size={14} />}>Profile</Menu.Item>

                        <Menu.Divider />

                        <Menu.Item color="red" icon={<MdLogout size={14} />} onClick={() => signOut()}>
                            Logout
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            </Group>
            <Drawer
                opened={navOpened}
                onClose={toggleNav}
                padding="sm"
                size="auto"
                title={<Title order={4}>Menu</Title>}
            >
                <Drawer.Body px={0}>
                    <Navbar />
                </Drawer.Body>
            </Drawer>
        </>
    );
};
