import { notifications } from '@mantine/notifications';
import axios, { isAxiosError } from 'axios';
import { GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import { getServerSession } from 'next-auth/next';
import { ParsedUrlQuery } from 'querystring';

import { Content } from '@components/layout/content';
import { Layout } from '@components/layout/layout';
import { GameForm, GameFormData } from '@components/views/game-form';
import { api, API_URL, APP_GAME_UID } from '@lib/api';

import { Game } from '..';
import { nextAuthOptions } from '../../api/auth/[...nextauth]';
import { UploadImageResponse } from '../add';

interface Params extends ParsedUrlQuery {
    gameId: string;
}

type Props = {
    game: Game;
};

const EditGame = ({ game }: Props) => {
    const { query } = useRouter();

    const onSuccessCallback = () => {
        notifications.show({
            title: 'Success',
            message: 'Game updated successfully',
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

    const uploadImage = async (file: File) => {
        const { data } = await api.post<UploadImageResponse>(
            `${API_URL}/api/Image/ImageUpload?typeId=1`,
            {
                File: file
            },
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        );
        return data;
    };

    const updateGame = async (values: {
        title?: string | null;
        description?: string | null;
        currentVersionIos?: string | null;
        currentVersionAndroid?: string | null;
        statusId?: boolean;
        landscape?: boolean;
        defaultTournamentImage?: string | null;
    }) => {
        const { data } = await api.put<Game>(`${API_URL}/api/AppGames/${query.gameId}`, values);
        return data;
    };

    const handleUpdateGame = async (values: GameFormData): Promise<Game> => {
        let imageURI;

        // if its string the image is unchanged
        if (values.defaultTournamentImage instanceof File) {
            const uploadedImage = await uploadImage(values.defaultTournamentImage);

            if (uploadedImage.success) {
                imageURI = uploadedImage.imageURI;
            }
        } else {
            imageURI = values.defaultTournamentImage;
        }

        if (
            !imageURI &&
            !(
                values.title &&
                values.description &&
                values.currentVersionIos &&
                values.currentVersionAndroid &&
                values.statusId &&
                values.landscape
            )
        ) {
            throw new Error('Missing required fields');
        }
        const payload = {
            title: values.title,
            description: values.description,
            currentVersionIos: values.currentVersionIos,
            currentVersionAndroid: values.currentVersionAndroid,
            // @ts-ignore
            statusId: Boolean(values.statusId === 'true'),
            // @ts-ignore
            landscape: Boolean(values.landscape === 'true'),
            defaultTournamentImage: imageURI
        };
        const response = await updateGame(payload);
        return response;
    };

    const onSubmit = async (data: GameFormData) => {
        try {
            await handleUpdateGame(data);
            onSuccessCallback();
        } catch (error) {
            console.error(error);
            onFailureCallback(error);
        }
    };
    console.log({ game });

    return (
        <Layout>
            <Content label="Edit game">
                <GameForm onSubmit={onSubmit} game={game} />
            </Content>
        </Layout>
    );
};

export async function getServerSideProps({ params, req, res }: GetServerSidePropsContext<Params>) {
    const { gameId } = params!;

    const session = await getServerSession(req, res, nextAuthOptions);
    // @ts-ignore
    const token = session?.accessToken;

    try {
        const { data } = await axios.get<Game>(`${API_URL}/api/AppGames/${gameId}`, {
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

        return { props: { game: data } };
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

export default EditGame;
