import { Button, Center, Container, Group, PasswordInput, Stack, TextInput, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconX } from '@tabler/icons-react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';
import { useState } from 'react';

import logo from '../../../public/images/logo-white.png';

const Login = () => {
    const [email, setEmail] = useState('emil.malanczak@inspeerity.com');
    const [password, setPassword] = useState('@s3%x5SVwQm$n8vL');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const authorize = async () => {
        setLoading(true);

        // https://stackoverflow.com/questions/70165993/how-to-handle-login-failed-error-in-nextauth-js
        const { ok, error }: any = await signIn('credentials', {
            email: 'emil.malanczak@inspeerity.com',
            password: '@s3%x5SVwQm$n8vL',
            callbackUrl: '/',
            redirect: false
        });

        if (ok) {
            await router.push('/');
            setLoading(false);
        } else {
            console.log(error);
            notifications.show({
                id: 'login-error',
                withCloseButton: true,
                title: 'Error',
                message: 'Something went wrong. Try again later.',
                color: 'red',
                icon: <IconX />,
                className: 'my-notification-class',
                style: { backgroundColor: 'red' },
                sx: { backgroundColor: 'red' },
                loading: false
            });
            setLoading(false);
        }
    };
    return (
        <Center
            sx={(theme) => ({
                backgroundColor: 'rgb(40, 51, 78)',
                minHeight: '100vh',
                width: '100%',
                overflow: 'hidden',
                position: 'relative',

                '&::before, &::after': {
                    ...theme.fn.cover(),
                    content: '""',
                    borderRadius: '100%',
                    transform: 'rotate(-4deg)',
                    width: '57%'
                },

                '&::after': {
                    margin: '-20% 0 -12% -13%',
                    backgroundColor: 'rgb(35, 45, 69)'
                },

                '&::before': {
                    margin: '-28% 0 -15% -13%',
                    backgroundColor: 'rgb(48, 61, 93)'
                }
            })}
        >
            <Container
                sx={() => ({
                    height: '100%',
                    width: '100%',
                    zIndex: 1
                })}
            >
                <Group position="apart">
                    <Image src={logo} height={164} alt="logo" style={{ flexGrow: 0 }} />

                    <Stack
                        style={{
                            maxWidth: '400px',
                            flexGrow: 1
                        }}
                    >
                        <Title>Sign in</Title>
                        <TextInput
                            label="Email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                            }}
                            placeholder="Your email"
                        />
                        <PasswordInput
                            label="Password"
                            placeholder="Your password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                            }}
                        />
                        <Button
                            variant="light"
                            onClick={authorize}
                            loading={loading}
                            disabled={loading}
                            sx={(theme) => ({
                                '&[data-disabled="true"]': {
                                    color: theme.colors.gray[4]
                                }
                            })}
                        >
                            Login
                        </Button>
                    </Stack>
                </Group>
            </Container>
        </Center>
    );
};

Login.requireAuth = false;

export default Login;
