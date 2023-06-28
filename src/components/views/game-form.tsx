import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Checkbox, FileInput, Group, Stack, Text, TextInput, Textarea } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconUpload } from '@tabler/icons-react';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as Yup from 'yup';
import { Asserts } from 'yup';

import { Game } from '../../pages/games';

const gamesAddSchema = Yup.object({
    title: Yup.string().required('Title is required'),
    description: Yup.string().required('Description is required'),
    currentVersionIos: Yup.string().required('iOS version is required'),
    currentVersionAndroid: Yup.string().required('Android version is required'),
    statusId: Yup.boolean().required('Status is required'),
    landscape: Yup.boolean().required('Landscape is required'),
    defaultTournamentImage: Yup.mixed<File | string>().required('Image is required')
});

export type GameFormData = Asserts<typeof gamesAddSchema>;

type Props = {
    onSubmit: (data: GameFormData) => Promise<void>;
    game?: Game;
};

export const GameForm = ({ onSubmit, game }: Props) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    console.log({
        game
    });
    const {
        register,
        handleSubmit,
        formState: { errors },
        control
    } = useForm<GameFormData>({
        mode: 'onSubmit',
        reValidateMode: 'onChange',
        resolver: yupResolver(gamesAddSchema),
        defaultValues: {
            title: game?.title ?? '',
            description: game?.description ?? '',
            currentVersionIos: game?.currentVersionIos ?? '',
            currentVersionAndroid: game?.currentVersionAndroid ?? '',
            statusId: game?.statusId ?? false,
            landscape: game?.landscape ?? false,
            defaultTournamentImage: game?.defaultTournamentImage ?? ''
        }
    });

    const onFormSubmit = async (data: GameFormData) => {
        setIsSubmitting(true);

        await onSubmit(data);

        setIsSubmitting(false);
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

    const onError = (errorss: any, e: any) => {
        onFailureCallback(e);
        console.log('ERROR:', errorss, e);
    };
    const renderFormError = (message?: string) =>
        !message ? null : (
            <Text color="red.5" className="text-red-500 text-sm mb-2 pb-2">
                {message}
            </Text>
        );

    const onCancel = () => {
        router.push('/games');
    };

    return (
        <form id="addUser" onSubmit={handleSubmit(onFormSubmit, onError)}>
            <Stack maw={550} spacing={8}>
                <TextInput
                    {...register('title')}
                    label="Title"
                    error={errors.title && renderFormError(errors.title?.message)}
                    placeholder="JohnDoe"
                />

                <Textarea
                    {...register('description')}
                    minRows={4}
                    maxRows={8}
                    label="Description"
                    error={errors.description && renderFormError(errors.description?.message)}
                    placeholder="Information about the game"
                />

                <TextInput
                    {...register('currentVersionIos')}
                    label="iOS Version"
                    error={errors.currentVersionIos && renderFormError(errors.currentVersionIos?.message)}
                    placeholder="16.0.0"
                />

                <TextInput
                    {...register('currentVersionAndroid')}
                    label="Android Version"
                    error={errors.currentVersionAndroid && renderFormError(errors.currentVersionAndroid?.message)}
                    placeholder="Android 11"
                />

                <Controller
                    name="defaultTournamentImage"
                    control={control}
                    render={({ field }) => (
                        <FileInput
                            {...field}
                            value={
                                field.value instanceof File
                                    ? field.value
                                    : new File([''], field.value, { type: 'image/png' })
                            }
                            label="Game image"
                            placeholder="Choose file"
                            error={
                                errors.defaultTournamentImage && renderFormError(errors.defaultTournamentImage?.message)
                            }
                            icon={<IconUpload size={14} />}
                        />
                    )}
                />

                <Checkbox
                    {...register('statusId')}
                    mt={8}
                    py={4}
                    label="Active"
                    error={errors.statusId && renderFormError(errors.statusId?.message)}
                />

                <Checkbox
                    {...register('landscape')}
                    py={4}
                    label="Landscape"
                    error={errors.landscape && renderFormError(errors.landscape?.message)}
                />

                <Group my={16}>
                    <Button
                        form="addUser"
                        type="submit"
                        disabled={isSubmitting}
                        variant="filled"
                        loading={isSubmitting}
                        loaderPosition="right"
                    >
                        {isSubmitting ? 'Saving...' : 'Save'}
                    </Button>
                    <Button onClick={onCancel} variant="default" disabled={isSubmitting}>
                        Cancel
                    </Button>
                </Group>
            </Stack>
        </form>
    );
};
