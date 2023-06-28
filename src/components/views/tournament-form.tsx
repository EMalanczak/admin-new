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
    MultiSelectProps
} from '@mantine/core';
import { Dropzone, FileWithPath, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { FC, useState } from 'react';
import { Controller, FormProvider, useForm, useFormContext } from 'react-hook-form';
import * as Yup from 'yup';

import { useImageUpload } from '@hooks/use-image-upload';

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
        [theme.fn.smallerThan('md')]: {
            alignItems: 'center',
            gap: 8
        }
    },
    separator: {
        [theme.fn.smallerThan('md')]: {
            marginLeft: 0,
            marginRight: 0
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
        games: Yup.array().min(1, 'At least one game is required'),
        name: Yup.string().required('Name is required'),
        image: Yup.string().required('Image is required'),
        fee: Yup.number().required('Fee is required'),
        freeEntries: Yup.number().required('Free entries is required'),
        password: Yup.string().required('Password is required'),
        priority: Yup.number().required('Priority is required'),
        platform: Yup.string()
            .oneOf(['iOS', 'Android', 'All'] as const)
            .required('Platform is required')
    })
);
const schema3 = schema2.concat(
    Yup.object({
        timezone: Yup.string().required('Timezone is required'),
        startDate: Yup.date().required('Start date is required'),
        endDate: Yup.date()
            .required('End date is required')
            .min(Yup.ref('arrivalDate'), 'Departure date must be after arrival date'),
        startTime: Yup.string().required('Start time is required'),
        endTime: Yup.string().required('End time is required'),
        duration: Yup.number().when('$type', {
            is: 'template',
            then: (schema) => schema.required('Duration is required'),
            otherwise: (schema) => schema
        })
    })
);

const schema4 = schema3.concat(
    Yup.object({
        payoutType: Yup.string()
            .oneOf(['Tokens', 'Cash', 'Prizes'] as const)
            .required('First place is required'),
        payoutAmount: Yup.number().required('First place is required'),
        description: Yup.string().required('Description is required'),
        payoutPlaces: Yup.number().required('Payout places is required')
    })
);

const schemaValidators = [
    // step 1 schema
    ['type'] as const,
    // step 2 schema
    ['games', 'name', 'image', 'fee', 'freeEntries', 'password', 'priority', 'platform'] as const,
    // step 3 schema,
    ['timezone', 'startDate', 'endDate', 'startTime', 'endTime', 'duration'] as const,
    // step 4 schema
    ['payoutType', 'payoutAmount', 'description', 'payoutPlaces'] as const
];
const STEPS_COUNT = schemaValidators.length;

const renderFormError = (message?: string) =>
    !message ? null : (
        <Text color="red.5" className="text-red-500 text-sm mb-2 pb-2">
            {message}
        </Text>
    );

type FormInputProps<T> = {
    component: FC<T>;
    name: string;
} & T;

// eslint-disable-next-line react/function-component-definition
function FormInput<T extends {} = {}>({ component: InputComponent, name, ...inputProps }: FormInputProps<T>) {
    const {
        control,
        formState: { errors, touchedFields },
        trigger
    } = useFormContext();

    return (
        <Controller
            name={name}
            control={control}
            render={({ field: { onChange, ...fieldRest } }) => (
                <InputComponent
                    {...fieldRest}
                    {...(inputProps as unknown as T)}
                    onChange={(...values: any[]) => {
                        onChange(...values);
                        if (touchedFields[name]) {
                            trigger('games');
                        }
                    }}
                    error={errors[name] && renderFormError(errors[name]?.message?.toString())}
                />
            )}
        />
    );
}

export const TournamentForm = () => {
    const [active, setActive] = useState(0);
    const [highestStepVisited, setHighestStepVisited] = useState(active);
    const { classes } = useStyles();
    const { uploadImage, loading: uploadingImage } = useImageUpload();

    const methods = useForm({
        mode: 'onSubmit',
        resolver: yupResolver(schema4)
    });

    const {
        register,
        formState: { errors },
        control,
        setValue,
        trigger
    } = methods;

    const activeSchema = schemaValidators[active];

    const handleStepChange = async (nextStep: number) => {
        const isOutOfBounds = nextStep > STEPS_COUNT || nextStep < 0;

        if (isOutOfBounds) {
            return;
        }

        if (active < nextStep) {
            console.log({
                nextStep
            });

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
        }
    };

    return (
        <FocusTrap active>
            <div>
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
                            <Text align="center" size="xl" my="xl">
                                Is this tournament a One off? Or a Template (Recurring)?
                            </Text>

                            <Group position="center">
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
                        </Stepper.Step>

                        <Stepper.Step label="Details" allowStepSelect={shouldAllowSelectStep(1)}>
                            <Group align="stretch">
                                <FormInput<MultiSelectProps>
                                    component={MultiSelect}
                                    name="games"
                                    label="Games"
                                    data={['test']}
                                    placeholder="Select game"
                                />
                                <Controller
                                    name="games"
                                    control={control}
                                    render={({ field: { onChange, ...fieldRest } }) => (
                                        <MultiSelect
                                            {...fieldRest}
                                            label="Games"
                                            onChange={(value) => {
                                                onChange(value);
                                                if (errors.games) {
                                                    trigger('games');
                                                }
                                            }}
                                            error={errors.games && renderFormError(errors.games?.message?.toString())}
                                            placeholder="Select game"
                                            data={['test']}
                                        />
                                    )}
                                />

                                <TextInput
                                    {...register('name')}
                                    label="Tournament name"
                                    error={errors.name && renderFormError(errors.name?.message?.toString())}
                                    placeholder="Grand prize tournament"
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
                                                    <Image width={96} height={96} src={field.value} alt="Tournament" />
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
                                <Controller
                                    name="fee"
                                    control={control}
                                    render={({ field }) => (
                                        <NumberInput
                                            {...field}
                                            label="Entry fee in TEC"
                                            error={errors.fee && renderFormError(errors.fee?.message?.toString())}
                                            placeholder="0"
                                        />
                                    )}
                                />

                                <Controller
                                    name="freeEntries"
                                    control={control}
                                    render={({ field }) => (
                                        <NumberInput
                                            {...field}
                                            label="Free entries"
                                            error={
                                                errors.freeEntries &&
                                                renderFormError(errors.freeEntries?.message?.toString())
                                            }
                                            placeholder="1"
                                        />
                                    )}
                                />

                                <PasswordInput
                                    {...register('password')}
                                    label="Password"
                                    error={errors.password && renderFormError(errors.password?.message?.toString())}
                                    placeholder="Grand prize tournament"
                                />

                                <Controller
                                    name="priority"
                                    control={control}
                                    render={({ field }) => (
                                        <NumberInput
                                            {...field}
                                            label="Display priority"
                                            error={
                                                errors.priority && renderFormError(errors.priority?.message?.toString())
                                            }
                                            placeholder="1"
                                        />
                                    )}
                                />

                                <Controller
                                    name="platform"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            label="Platform"
                                            placeholder="All"
                                            error={
                                                errors.platform && renderFormError(errors.platform?.message?.toString())
                                            }
                                            data={['iOS', 'Android', 'All']}
                                        />
                                    )}
                                />
                            </Group>
                        </Stepper.Step>

                        <Stepper.Step label="Dates" allowStepSelect={shouldAllowSelectStep(2)}>
                            <Controller
                                name="timezone"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        label="Timezone"
                                        placeholder="UTC"
                                        error={errors.timezone && renderFormError(errors.timezone?.message?.toString())}
                                        data={['iOS', 'Android', 'All']}
                                    />
                                )}
                            />
                        </Stepper.Step>

                        <Stepper.Step label="Payouts" allowStepSelect={shouldAllowSelectStep(2)}>
                            <div>Step 3 div: Get full access</div>
                        </Stepper.Step>

                        <Stepper.Step label="Finalize" allowStepSelect={shouldAllowSelectStep(2)}>
                            <div>Step 3 div: Get full access</div>
                        </Stepper.Step>

                        <Stepper.Completed>
                            <div>Completed, click back button to get to previous step</div>
                        </Stepper.Completed>
                    </Stepper>

                    {active !== 0 && (
                        <Group position="center" mt="xl">
                            <Button variant="default" onClick={() => handleStepChange(active - 1)}>
                                Back
                            </Button>
                            <Button onClick={() => handleStepChange(active + 1)}>
                                {active === STEPS_COUNT ? 'Submit' : 'Next step'}
                            </Button>
                        </Group>
                    )}
                </FormProvider>
            </div>
        </FocusTrap>
    );
};
