import { notifications } from '@mantine/notifications';

import { api, API_URL } from '@lib/api';

import { Content } from '../../components/layout/content';
import { Layout } from '../../components/layout/layout';
import { GameForm, GameFormData } from '../../components/views/game-form';

import { Game } from '.';

export interface UploadImageResponse {
    success: boolean;
    message: string | null;
    imageURI: string;
}

const AddGame = () => {
    const onSuccessCallback = (createdGame: Game) => {
        const { id } = createdGame;

        notifications.show({
            title: 'Success',
            message: `Game added successfully. ID: ${id}`,
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

    const createGame = async (values: {
        title?: string | null;
        description?: string | null;
        currentVersionIos?: string | null;
        currentVersionAndroid?: string | null;
        statusId?: boolean;
        landscape?: boolean;
        defaultTournamentImage?: string | null;
    }) => {
        const { data } = await api.post<Game>(`${API_URL}/api/AppGames`, values);
        return data;
    };

    const handleNewGame = async (values: GameFormData): Promise<Game> => {
        const { imageURI } = await uploadImage(values.defaultTournamentImage as File);

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
        const response = await createGame(payload);
        return response;
    };

    const onSubmit = async (data: GameFormData) => {
        try {
            const createdGame = await handleNewGame(data);
            if (createdGame) {
                // Callback for Success!
                onSuccessCallback(createdGame);
            } else {
                throw new Error('Something went wrong while adding new game');
            }
        } catch (error) {
            console.error(error);
            onFailureCallback(error);
        }
    };

    return (
        <Layout>
            <Content label="Add user">
                <GameForm onSubmit={onSubmit} />
            </Content>
        </Layout>
    );
};
export default AddGame;
