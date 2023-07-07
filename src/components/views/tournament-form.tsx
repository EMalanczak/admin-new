import { yupResolver } from '@hookform/resolvers/yup';
import {
    Stepper,
    Button,
    Group,
    createStyles,
    Text,
    Image,
    MultiSelect,
    TextInput,
    Input,
    NumberInput,
    PasswordInput,
    Select,
    FocusTrap,
    MultiSelectProps,
    TextInputProps,
    NumberInputProps,
    PasswordInputProps,
    SelectProps,
    ActionIcon,
    Stack,
    RadioProps,
    Radio,
    Loader,
    Table,
    LoadingOverlay
} from '@mantine/core';
import { DateTimePicker, DateTimePickerProps } from '@mantine/dates';
import { Dropzone, FileWithPath, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { closeModal, modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { useDebounce } from 'use-debounce';
import * as Yup from 'yup';

import { FormInput, renderFormError } from '@components/form-input';
import { useImageUpload } from '@hooks/use-image-upload';
import { usePayoutDetails, usePayouts } from '@hooks/use-payouts';
import { useTimezones } from '@hooks/use-timezones';
import { useTournamentPlatforms } from '@hooks/use-tournament-platforms';
import { api } from '@lib/api';

import { PayoutForm, PayoutFormData, PayoutFormDetail } from './payout-form';

import { useGamesList } from '../../pages/games';
import { PayoutDto, TournamentDto } from '../../types/dto';
import { PayoutDetail, PayoutDetailsResponse, PayoutResponse } from '../../types/response';

declare module 'react' {
    function forwardRef<T, P = {}>(
        render: (props: P, ref: React.Ref<T>) => React.ReactElement | null
    ): (props: P & React.RefAttributes<T>) => React.ReactElement | null;
}

const GAP = 20;

const useStyles = createStyles((theme) => ({
    stepper: {
        gap: theme.spacing.lg,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',

        [theme.fn.smallerThan('md')]: {
            display: 'grid',
            gridTemplateColumns: 'max-content 1fr'
        }
    },
    stepContent: {
        padding: `${theme.spacing.sm} ${theme.spacing.md}`,
        borderTop: `1px solid ${theme.fn.rgba(theme.colors.gray[2], 0.1)}`,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',

        [theme.fn.smallerThan('md')]: {
            borderLeft: `1px solid ${theme.fn.rgba(theme.colors.gray[2], 0.1)}`,
            borderTop: 'none'
        }
    },
    step: {
        flexDirection: 'column',
        gap: theme.spacing.sm
    },
    stepBody: {
        margin: 0
    },
    stepLabel: {
        textAlign: 'center'
    },
    steps: {
        flexShrink: 0,
        [theme.fn.smallerThan('md')]: {
            alignItems: 'center',
            gap: 8
        },

        [theme.fn.smallerThan('sm')]: {
            overflow: 'auto'
        }
    },
    separator: {
        [theme.fn.smallerThan('md')]: {
            marginLeft: 0,
            marginRight: 0
        }
    },

    input: {
        maxWidth: 360,
        width: `calc(50% - ${GAP / 2}px)`,

        [theme.fn.smallerThan('sm')]: {
            width: '100%'
        }
    }
}));

const schema1 = Yup.object({
    type: Yup.string()
        .oneOf(['single', 'template'] as const)
        .required('Type is required')
});

const schema2 = schema1.concat(
    Yup.object({
        games: Yup.array().required('At least one game is required').min(1, 'At least one game is required'),
        name: Yup.string().required('Name is required'),
        image: Yup.string().required('Image is required'),
        fee: Yup.number().required('Fee is required').positive('Fee must be positive number'),
        freeEntries: Yup.number()
            .required('Free entries is required')
            .default(0)
            .positive('Free entries must be positive number'),
        password: Yup.string().required('Password is required'),
        priority: Yup.number().required('Priority is required').positive('Priority must be positive number'),
        platform: Yup.number()
            .oneOf([0, 1, 2] as const)
            .required('Platform is required')
    })
);

const schema3 = schema2.concat(
    Yup.object({
        timezone: Yup.string().required('Timezone is required'),
        startDate: Yup.date().required('Start date is required'),
        endDate: Yup.date()
            .required('End date is required')
            .when('startDate', {
                is: (startDate: any) => !!startDate,
                then: (schema) => schema.min(Yup.ref('startDate'), 'End date must be after start date'),
                otherwise: (schema) => schema
            }),
        gap: Yup.number().when('type', {
            is: 'template',
            then: (schema) => schema.required('Gap is required').min(1, 'Gap must be at least 1 minute'),
            otherwise: (schema) => schema
        }),
        duration: Yup.number().when('type', {
            is: 'template',
            then: (schema) => schema.required('Duration is required'),
            otherwise: (schema) => schema
        }),

        dayOption: Yup.string().when('type', {
            is: 'template',
            then: (schema) =>
                schema
                    .oneOf(['every-day', 'every-week-end', 'every-week-day'] as const)
                    .required('Day option is required'),
            otherwise: (schema) => schema
        })
    })
);

const schema4 = schema3.concat(
    Yup.object({
        payoutType: Yup.string()
            .oneOf(['0', '1', '2'] as const, "Payout type can be only 'Tokens', 'Cash' or 'Prizes'")
            .required('First place is required'),
        payoutAmount: Yup.number().when('payoutType', {
            is: (type: string) => typeof type === 'number' && type === '2',
            then: (schema) => schema,
            otherwise: (schema) => schema.required('Payout is required')
        }),
        description: Yup.string().required('Description is required'),
        payoutId: Yup.number().required('Payout is required')
    })
);

const schemaKeyValidators = [
    // step 1 schema
    Object.keys(schema1.fields),
    // step 2 schema
    Object.keys(schema2.fields),
    // step 3 schema,
    Object.keys(schema3.fields),
    // step 4 schema
    Object.keys(schema4.fields)
];
const STEPS_COUNT = schemaKeyValidators.length;

const changeDateTimezoneToUtc = (date: Date) => {
    const offset = date.getTimezoneOffset() * -1;
    const utcDate = dayjs(date).add(offset, 'minute').toDate();

    return utcDate.toISOString();
};

const tournamentToDto = (tournament: Yup.InferType<typeof schema4>): TournamentDto => ({
    appGameId: tournament.games[0],
    tournamentName: tournament.name,
    tournamentImage: tournament.image ?? '',
    payout: tournament.payoutAmount ?? 0,
    cashTournament: tournament.payoutType === '1',
    startDate: changeDateTimezoneToUtc(tournament.startDate),
    endDate: changeDateTimezoneToUtc(tournament.endDate),
    gapBetweenTournament: tournament.gap ?? 0,
    entryFee: tournament.fee,
    active: true,
    freeEntries: tournament.freeEntries,
    platformId: tournament.platform,
    prioritySequence: tournament.priority,
    password: tournament.password,
    payoutId: tournament.payoutId,
    bots: false,
    payoutDescription: tournament.description,
    metaData: '',
    weekendTournament: tournament.dayOption === 'every-week-end' || tournament.dayOption === 'every-day',
    weekdayOnly: tournament.dayOption === 'every-week-day' || tournament.dayOption === 'every-day',
    gapBetween: tournament.gap ?? 0,
    createdAt: new Date().toISOString(),
    modified: new Date().toISOString(),
    timezoneId: tournament.timezone
});

const payoutToDto = (payout: Partial<PayoutFormData> & Pick<PayoutFormData, 'name'>): PayoutDto => ({
    name: payout.name,
    id: 0,
    createdAt: new Date().toISOString(),
    modified: new Date().toISOString()
});

const payoutDetailToDto = (detail: Required<PayoutFormDetail>, payoutId: number): PayoutDetail => ({
    position: detail.position,
    percentage: detail.percentage,
    createdAt: new Date().toISOString(),
    modified: new Date().toISOString(),
    id: 0,
    payoutId
});

export const TournamentForm = () => {
    const [active, setActive] = useState(0);
    const [highestStepVisited, setHighestStepVisited] = useState(active);
    const { classes } = useStyles();
    const { uploadImage, loading: uploadingImage } = useImageUpload();

    const [gamesQuery, setGamesQuery] = useDebounce('', 500);
    const { platforms, isLoading: platformsLoading } = useTournamentPlatforms();
    const { payouts, isLoading: payoutsLoading, mutate: mutatePayouts } = usePayouts();

    const {
        data: { gamesList },
        loading: gamesLoading
    } = useGamesList(
        {
            search: gamesQuery,
            PageSize: 100,
            active: true
        },
        {
            keepPreviousData: false
        }
    );

    const methods = useForm({
        mode: 'onSubmit',
        resolver: yupResolver(schema4)
    });

    const {
        watch,
        formState: { errors },
        control,
        setValue,
        trigger,
        handleSubmit,
        reset
    } = methods;

    const payoutId = watch('payoutId');
    const { details, isLoading: detailsLoading } = usePayoutDetails(payoutId);
    const { timezones, isLoading: timezonesLoading } = useTimezones();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const activeSchema = schemaKeyValidators[active] as Parameters<typeof trigger>[0];

    const handleStepChange = async (nextStep: number) => {
        const isOutOfBounds = nextStep > STEPS_COUNT || nextStep < 0;

        if (isOutOfBounds) {
            return;
        }

        if (active < nextStep) {
            const isValid = await trigger(activeSchema);

            if (!isValid) {
                return;
            }
        }
        setActive(nextStep);
        setHighestStepVisited((hSC) => Math.max(hSC, nextStep));
    };

    // Allow the user to freely go back and forth between visited steps.
    const shouldAllowSelectStep = (step: number) => highestStepVisited >= step && active !== step;

    const handleImageUpload = async (images: FileWithPath[]) => {
        const uploadedImage = await uploadImage(images[0]);

        if (uploadedImage.success) {
            setValue('image', uploadedImage.imageURI);
        } else {
            notifications.show({
                title: 'Error',
                message: 'Something went wrong uploading image',
                color: 'red',
                autoClose: 5000
            });
        }
    };

    const tournamentType = watch('type');

    const handleCreatePayout = async (payoutData: PayoutFormData) => {
        const createPayout = async (name: string) => {
            const { data: payout } = await api.post<PayoutResponse>(
                '/Payouts',
                payoutToDto({
                    name
                })
            );

            return payout;
        };

        try {
            const newPayout = await createPayout(payoutData.name);

            if (newPayout) {
                // payout created so we can create payout details
                await api.post<PayoutDetailsResponse>(
                    '/PayoutDetails',
                    payoutData.payoutDetails.map((detail) =>
                        payoutDetailToDto(detail as Required<PayoutFormDetail>, newPayout.id)
                    )
                );

                await mutatePayouts();

                setValue('payoutId', `${newPayout.id}` as unknown as number);

                closeModal('create-payout');
            } else {
                notifications.show({
                    title: 'Error',
                    message: 'Something went wrong creating payout',
                    color: 'red',
                    autoClose: 5000
                });
            }
        } catch (e) {
            notifications.show({
                title: 'Error',
                message: 'Something went wrong',
                color: 'red',
                autoClose: 5000
            });
        }
    };

    const onCreatePayout = (query: string) => {
        modals.open({
            centered: true,
            title: 'Create new payout',
            w: 'auto',
            withinPortal: true,
            modalId: 'create-payout',
            children: (
                <PayoutForm
                    onSubmit={handleCreatePayout}
                    initialValues={{
                        name: query
                    }}
                />
            )
        });

        // for typing reasons of mantine Select
        return undefined;
    };

    const handleSubmitForm = async (data: any) => {
        setIsSubmitting(true);

        try {
            const tournamentDto = tournamentToDto(data);
            const isTemplate = data.type === 'template';
            await api.post<PayoutResponse>(
                `/Tournaments/${isTemplate ? 'CreateRepeatableTournament' : 'CreateTournament'}`,
                isTemplate
                    ? tournamentDto
                    : {
                          ...tournamentDto,
                          durationInMinutes: data.duration
                      }
            );

            notifications.show({
                title: 'Success',
                message: 'Tournament created',
                color: 'green',
                autoClose: 5000
            });

            setActive(0);
            setHighestStepVisited(0);
            reset();
        } catch (e: any) {
            if (typeof e?.response?.data === 'string') {
                notifications.show({
                    title: 'Error',
                    message: e.response.data,
                    color: 'red',
                    autoClose: 5000
                });
            } else {
                notifications.show({
                    title: 'Error',
                    message: (
                        <Text>
                            {e?.message ?? 'Something went wrong'}
                            <br /> Contact admin for details
                        </Text>
                    ),
                    color: 'red',
                    autoClose: 5000
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const navigationButtons = (
        <Group position="center" mt="xl" mb="xs">
            <Button id="prev-step-button" variant="default" onClick={() => handleStepChange(active - 1)}>
                Back
            </Button>
            <Button id="next-step-button" onClick={() => handleStepChange(active + 1)}>
                {active === STEPS_COUNT ? 'Submit' : 'Next step'}
            </Button>
        </Group>
    );

    return (
        <FocusTrap active>
            <form
                onSubmit={handleSubmit(handleSubmitForm)}
                style={{ overflow: 'hidden', position: 'relative', height: '100%' }}
            >
                <LoadingOverlay visible={isSubmitting} overlayColor="rgb(27, 37, 59)" transitionDuration={300} />

                <FormProvider {...methods}>
                    <Stepper
                        active={active}
                        onStepClick={setActive}
                        breakpoint="md"
                        classNames={{
                            root: classes.stepper,
                            content: classes.stepContent,
                            step: classes.step,
                            stepBody: classes.stepBody,
                            stepLabel: classes.stepLabel,
                            steps: classes.steps,
                            separator: classes.separator
                        }}
                    >
                        <Stepper.Step label="Type" allowStepSelect={shouldAllowSelectStep(0)}>
                            <Stack spacing={20} style={{ overflowY: 'auto' }}>
                                <Text align="center" size="xl" my="xl">
                                    Is this tournament a One off? Or a Template (Recurring)?
                                </Text>

                                <Group position="center" mb="xs">
                                    <Button
                                        size="xl"
                                        onClick={() => {
                                            setValue('type', 'single');
                                            handleStepChange(active + 1);
                                        }}
                                    >
                                        One off
                                    </Button>
                                    <Button
                                        size="xl"
                                        onClick={() => {
                                            setValue('type', 'template');
                                            handleStepChange(active + 1);
                                        }}
                                    >
                                        Template
                                    </Button>
                                </Group>
                            </Stack>
                        </Stepper.Step>

                        <Stepper.Step label="Details" allowStepSelect={shouldAllowSelectStep(1)}>
                            <Stack spacing={20} style={{ overflowY: 'auto' }}>
                                <Group align="stretch">
                                    <FormInput<TextInputProps>
                                        component={TextInput}
                                        name="name"
                                        label="Tournament name"
                                        placeholder="Grand prize tournament"
                                        className={classes.input}
                                    />

                                    <FormInput<MultiSelectProps>
                                        component={MultiSelect}
                                        name="games"
                                        label="Games"
                                        data={
                                            gamesList?.map((game) => ({
                                                value: `${game.id}`,
                                                label: game.title ?? 'Unknown'
                                            })) ?? []
                                        }
                                        placeholder="Select game"
                                        searchable
                                        clearable
                                        disabled={gamesLoading}
                                        onSearchChange={setGamesQuery}
                                        rightSection={
                                            gamesLoading && (
                                                <ActionIcon>
                                                    <Loader size={16} />
                                                </ActionIcon>
                                            )
                                        }
                                        className={classes.input}
                                    />
                                </Group>

                                <Group my={16} align="stretch">
                                    <Controller
                                        name="image"
                                        control={control}
                                        render={({ field }) => (
                                            <div>
                                                <Input.Label htmlFor={field.name}>Image</Input.Label>
                                                {field.value ? (
                                                    <div>
                                                        <Image
                                                            width={96}
                                                            height={96}
                                                            src={field.value}
                                                            alt="Tournament"
                                                        />
                                                        <Button
                                                            onClick={() => {
                                                                setValue('image', '');
                                                            }}
                                                        >
                                                            Remove
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <Dropzone
                                                            accept={IMAGE_MIME_TYPE}
                                                            onDrop={handleImageUpload}
                                                            py={24}
                                                            px={40}
                                                            disabled={uploadingImage}
                                                            loading={uploadingImage}
                                                            sx={(theme) => ({
                                                                border: errors.image
                                                                    ? `2px dashed ${theme.colors.red[5]}`
                                                                    : undefined
                                                            })}
                                                        >
                                                            <Text align="center">
                                                                Drop images <br /> or
                                                            </Text>
                                                            <Button mt={4}>Click here</Button>
                                                        </Dropzone>
                                                        {errors.image && (
                                                            <Input.Error>
                                                                {renderFormError(errors.image?.message?.toString())}
                                                            </Input.Error>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    />
                                </Group>
                                <Group align="stretch">
                                    <FormInput<NumberInputProps>
                                        component={NumberInput}
                                        name="fee"
                                        label="Entry fee in TEC"
                                        placeholder=""
                                        className={classes.input}
                                    />

                                    <FormInput<NumberInputProps>
                                        component={NumberInput}
                                        name="freeEntries"
                                        label="Free entries"
                                        placeholder=""
                                        className={classes.input}
                                    />

                                    <FormInput<PasswordInputProps>
                                        component={PasswordInput}
                                        name="password"
                                        label="Password"
                                        placeholder=""
                                        className={classes.input}
                                    />

                                    <FormInput<NumberInputProps>
                                        component={NumberInput}
                                        name="priority"
                                        label="Display priority"
                                        placeholder=""
                                        className={classes.input}
                                    />

                                    <FormInput<SelectProps>
                                        component={Select}
                                        name="platform"
                                        label="Platform"
                                        placeholder="Select platform"
                                        data={platforms ?? []}
                                        disabled={platformsLoading}
                                        className={classes.input}
                                        rightSection={
                                            platformsLoading && (
                                                <ActionIcon>
                                                    <Loader size={16} />
                                                </ActionIcon>
                                            )
                                        }
                                    />
                                </Group>
                            </Stack>
                            {navigationButtons}
                        </Stepper.Step>

                        <Stepper.Step label="Dates" allowStepSelect={shouldAllowSelectStep(2)}>
                            <Stack spacing={20} style={{ overflowY: 'auto' }}>
                                <Group align="stretch">
                                    <FormInput<SelectProps>
                                        component={Select}
                                        name="timezone"
                                        label="Timezone"
                                        placeholder="UTC"
                                        data={timezones.map((timezone) => ({
                                            value: timezone.id,
                                            label: timezone.displayName
                                        }))}
                                        searchable
                                        w="100%"
                                        maw={500}
                                        disabled={timezonesLoading}
                                        rightSection={
                                            timezonesLoading && (
                                                <ActionIcon>
                                                    <Loader size={16} />
                                                </ActionIcon>
                                            )
                                        }
                                    />
                                </Group>
                                <Group align="stretch">
                                    <FormInput<DateTimePickerProps>
                                        name="startDate"
                                        component={DateTimePicker}
                                        valueFormat="DD/MM/YYYY - HH:mm"
                                        label="Start date"
                                        placeholder="Select date"
                                        className={classes.input}
                                    />
                                </Group>
                                {tournamentType === 'template' && (
                                    <Group align="stretch">
                                        <FormInput<NumberInputProps>
                                            component={NumberInput}
                                            name="duration"
                                            label="Duration in mins"
                                            placeholder=""
                                            className={classes.input}
                                        />
                                        <FormInput<NumberInputProps>
                                            component={NumberInput}
                                            name="gap"
                                            label="Gap between in mins"
                                            placeholder=""
                                            className={classes.input}
                                        />

                                        <Stack>
                                            <Text size="sm">Day option</Text>
                                            <FormInput<RadioProps>
                                                component={Radio}
                                                name="dayOption"
                                                value="every-day"
                                                label="Every day"
                                                className={classes.input}
                                            />
                                            <FormInput<RadioProps>
                                                component={Radio}
                                                name="dayOption"
                                                value="every-week-end"
                                                label="Weekend only"
                                                className={classes.input}
                                            />
                                            <FormInput<RadioProps>
                                                component={Radio}
                                                name="dayOption"
                                                value="every-week-day"
                                                label="Week days only"
                                                className={classes.input}
                                            />
                                        </Stack>
                                    </Group>
                                )}
                                <Group align="stretch">
                                    <FormInput<DateTimePickerProps>
                                        name="endDate"
                                        popoverProps={{ position: 'bottom' }}
                                        component={DateTimePicker}
                                        valueFormat="DD/MM/YYYY - HH:mm"
                                        label={tournamentType === 'template' ? 'Stop date' : 'End date'}
                                        placeholder="Select date"
                                        className={classes.input}
                                    />
                                </Group>
                                {navigationButtons}
                            </Stack>
                        </Stepper.Step>

                        <Stepper.Step
                            label="Payouts"
                            styles={{
                                stepWrapper: {
                                    overflowY: 'auto'
                                }
                            }}
                            allowStepSelect={shouldAllowSelectStep(2)}
                        >
                            <Stack spacing={20} style={{ overflowY: 'auto' }}>
                                <Group align="stretch">
                                    <FormInput<SelectProps>
                                        component={Select}
                                        name="payoutType"
                                        label="Payout type"
                                        placeholder="Tokens"
                                        key={active}
                                        className={classes.input}
                                        data={[
                                            { value: '0', label: 'Tokens' },
                                            { value: '1', label: 'Cash' },
                                            { value: '2', label: 'Prizes' }
                                        ]}
                                    />
                                    <FormInput<NumberInputProps>
                                        component={NumberInput}
                                        name="payoutAmount"
                                        label="Payout amount"
                                        placeholder=""
                                        className={classes.input}
                                    />

                                    <FormInput<TextInputProps>
                                        component={TextInput}
                                        name="description"
                                        label="Description"
                                        placeholder=""
                                        className={classes.input}
                                    />

                                    <FormInput<SelectProps>
                                        component={Select}
                                        name="payoutId"
                                        label="Payout"
                                        placeholder="Tokens"
                                        data={payouts}
                                        searchable
                                        disabled={payoutsLoading}
                                        getCreateLabel={(query) => `+ Create ${query}`}
                                        creatable
                                        onCreate={onCreatePayout}
                                        className={classes.input}
                                        rightSection={
                                            payoutsLoading && (
                                                <ActionIcon>
                                                    <Loader size={16} />
                                                </ActionIcon>
                                            )
                                        }
                                    />
                                </Group>
                                {payoutId && (
                                    <Table>
                                        <thead>
                                            <tr>
                                                <th>Position</th>
                                                <th>Percentage</th>
                                                <th>Prize</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {detailsLoading ? (
                                                <Loader size={32} m={16} />
                                            ) : (
                                                details.map(({ id, position, percentage, prize }) => (
                                                    <tr key={id}>
                                                        <td>{position}</td>
                                                        <td>{percentage}%</td>
                                                        <td>{prize}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </Table>
                                )}
                            </Stack>
                            {navigationButtons}
                        </Stepper.Step>

                        <Stepper.Step label="Finalize" allowStepSelect={shouldAllowSelectStep(2)}>
                            <Text align="center" my="md">
                                Do you want to create a tournament?
                            </Text>
                            <Group position="center" mb="xs">
                                <Button size="xl" onClick={() => handleStepChange(active - 1)}>
                                    Back
                                </Button>
                                <Button size="xl" type="submit">
                                    Submit
                                </Button>
                            </Group>
                        </Stepper.Step>

                        <Stepper.Completed>
                            <div>Tournament created, click back button to get to previous page</div>
                        </Stepper.Completed>
                    </Stepper>
                </FormProvider>
            </form>
        </FocusTrap>
    );
};
