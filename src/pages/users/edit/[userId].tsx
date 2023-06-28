import { notifications } from '@mantine/notifications';
import axios, { isAxiosError } from 'axios';
import { GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import { getServerSession } from 'next-auth/next';
import { ParsedUrlQuery } from 'querystring';

import { User } from '@hooks/use-random-username';
import { api, API_URL, APP_GAME_UID } from '@lib/api';

import { Content } from '../../../components/layout/content';
import { Layout } from '../../../components/layout/layout';
import { UserForm, UserFormData } from '../../../components/views/user-form';
import { nextAuthOptions } from '../../api/auth/[...nextauth]';

interface Params extends ParsedUrlQuery {
    id: string;
}

type Props = {
    user: User;
};

const EditUser = ({ user }: Props) => {
    const { query } = useRouter();

    const onSuccessCallback = () => {
        notifications.show({
            title: 'Success',
            message: 'User updated successfully',
            color: 'green.5',
            autoClose: 2500
        });
        window.scrollTo(0, 0);
    };

    const onFailureCallback = (error: any) => {
        notifications.show({
            title: 'Error',
            message: error.message || 'Something went wrong',
            color: 'red.5',
            autoClose: 2500
        });
        window.scrollTo(0, 0);
    };

    const handleUpdateUser = async (values: UserFormData): Promise<void> => {
        if (
            !(values.image && values.username && values.email && values.password && values.countryId && values.roleId)
        ) {
            throw new Error('Missing required fields');
        }
        const payload = {
            image: values.image,
            username: values.username,
            email: values.email,
            roleId: Number(values.roleId),
            countryId: Number(values.countryId)
        };

        await api.put<User>(`${API_URL}/api/Users/${query.userId}`, payload);
    };

    const onSubmit = async (data: UserFormData) => {
        try {
            await handleUpdateUser(data);
            onSuccessCallback();
        } catch (error) {
            console.error(error);
            onFailureCallback(error);
        }
    };
    console.log({ user });

    return (
        <Layout>
            <Content label="Edit user">
                <UserForm onSubmit={onSubmit} user={user} />
            </Content>
        </Layout>
    );
};

export async function getServerSideProps({ params, req, res }: GetServerSidePropsContext<Params>) {
    const { userId } = params!;

    const session = await getServerSession(req, res, nextAuthOptions);
    // @ts-ignore
    const token = session?.accessToken;

    try {
        const { data } = await axios.get<User>(`${API_URL}/api/Users/${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            params: {
                appGameUid: APP_GAME_UID
            }
        });

        if (!data) {
            return {
                redirect: {
                    destination: '/404',
                    permanent: false
                },
                props: {}
            };
        }

        return { props: { user: data } };
    } catch (error) {
        console.error({ error });

        if (isAxiosError(error) && error.response?.status === 404) {
            return {
                redirect: {
                    destination: '/404',
                    permanent: false
                },
                props: {}
            };
        }

        return {
            redirect: {
                destination: '/500',
                permanent: false
            },
            props: {}
        };
    }
}

export default EditUser;
