import { yupResolver } from '@hookform/resolvers/yup';
import {
    ActionIcon,
    Button,
    Group,
    NumberInput,
    NumberInputProps,
    ScrollArea,
    Stack,
    Text,
    TextInput,
    TextInputProps,
    createStyles
} from '@mantine/core';
import { closeModal } from '@mantine/modals';
import { useState } from 'react';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { FaPlus } from 'react-icons/fa';
import { TbTrash } from 'react-icons/tb';
import * as Yup from 'yup';

import { FormInput, renderFormError } from '@components/form-input';

export type PayoutFormDetail = {
    percentage: number;
    position?: number;
};

export type PayoutFormData = {
    name: string;
    payoutDetails: PayoutFormDetail[];
};

const payoutDetailSchema = Yup.object({
    percentage: Yup.number()
        .max(100, 'Percentage must be less than 100')
        .min(0, 'Percentage must be greater than 0')
        .required('Percentage is required')
});

const payoutSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    payoutDetails: Yup.array()
        .of(payoutDetailSchema)
        .default([])
        .min(1, 'At least one payout detail is required')
        .test('sum-of-percentage', 'The sum of the percentages must be 100', (datails) => {
            const sum = datails?.reduce((acc, datail) => acc + datail.percentage, 0) || 0;
            return sum === 100;
        })
});

type Props = {
    onSubmit: (data: PayoutFormData) => Promise<void>;
    initialValues?: Partial<PayoutFormData>;
    // payout?: any; // TODO: add type
};

const useStyles = createStyles((theme) => ({
    labels: {
        padding: `${theme.spacing.xs} ${theme.spacing.sm}`
    },
    item: {
        padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
        borderTop: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.white}`
    },

    itemDragging: {
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[2] : theme.colors.gray[0]
    },

    dragHandle: {
        ...theme.fn.focusStyles(),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: theme.colorScheme === 'dark' ? theme.colors.dark[1] : theme.colors.gray[6]
    }
}));

export const PayoutForm = ({ onSubmit, initialValues }: Props) => {
    const [submitting, setSubmitting] = useState(false);
    const methods = useForm<PayoutFormData>({
        mode: 'all',
        reValidateMode: 'onChange',
        resolver: yupResolver(payoutSchema),
        defaultValues: {
            payoutDetails: [
                {
                    percentage: 50
                },
                {
                    percentage: 30
                },
                {
                    percentage: 15
                },
                {
                    percentage: 5
                }
            ],
            ...initialValues
        }
    });

    const {
        handleSubmit,
        formState: { errors },
        control
    } = methods;
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'payoutDetails'
    });

    const { classes } = useStyles();
    const onFormSubmit = async (data: PayoutFormData) => {
        setSubmitting(true);
        await onSubmit({
            ...data,
            payoutDetails: data.payoutDetails.map((detail, index) => ({
                ...detail,
                position: index + 1
            }))
        });
        setSubmitting(false);
    };

    return (
        <form onSubmit={handleSubmit(onFormSubmit)}>
            <FormProvider {...methods}>
                <FormInput<TextInputProps>
                    component={TextInput}
                    name="name"
                    label="Payout name"
                    placeholder="eg. World championship top 10"
                />

                <Group mt={16} className={classes.labels}>
                    <Text align="right" size="xs" style={{ width: 104 }}>
                        Position
                    </Text>
                    <Text align="right" size="xs" style={{ flexGrow: 1 }}>
                        Percentage
                    </Text>
                </Group>

                <ScrollArea h={320} type="always">
                    <Stack spacing={0}>
                        {fields.map((item, index) => (
                            <Group key={item.id} className={classes.item} noWrap>
                                <ActionIcon
                                    variant="subtle"
                                    size="sm"
                                    color="red"
                                    p={4}
                                    onClick={() => {
                                        remove(index);
                                    }}
                                >
                                    <TbTrash />
                                </ActionIcon>
                                <Text align="right" style={{ width: 66 }}>
                                    {index + 1}
                                </Text>

                                <FormInput<NumberInputProps>
                                    component={NumberInput}
                                    name={`payoutDetails.${index}.percentage`}
                                    placeholder="eg. World championship top 10"
                                    ml="auto"
                                    decimalSeparator=","
                                    precision={2}
                                    step={0.5}
                                    stepHoldDelay={500}
                                    stepHoldInterval={(t) => Math.max(1000 / t ** 2, 25)}
                                    error={!!errors.payoutDetails?.message}
                                    min={0}
                                    max={100}
                                />
                            </Group>
                        ))}
                        <Button
                            ml="auto"
                            mr="xs"
                            mb={16}
                            variant="light"
                            compact
                            size="xs"
                            rightIcon={<FaPlus size={10} />}
                            onClick={() => {
                                append({
                                    percentage: 0
                                });
                            }}
                        >
                            Add
                        </Button>
                    </Stack>
                    <Text>{renderFormError(errors.payoutDetails?.message)}</Text>
                </ScrollArea>
            </FormProvider>
            <Group position="right" pt={4}>
                <Button
                    variant="default"
                    loading={submitting}
                    disabled={submitting}
                    onClick={() => {
                        closeModal('create-payout');
                    }}
                >
                    Cancel
                </Button>
                <Button type="submit" loading={submitting} disabled={submitting}>
                    Save
                </Button>
            </Group>
        </form>
    );
};
