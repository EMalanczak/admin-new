import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Group, Image, Loader, PasswordInput, Select, Stack, Text, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/router';
import { useState, useMemo, forwardRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { MdOutlineBrokenImage } from 'react-icons/md';
import { TiArrowSync } from 'react-icons/ti';
import * as Yup from 'yup';

import { useCountries } from '@hooks/use-countries';
import { User, useRandomUsername } from '@hooks/use-random-username';
import { useRoles } from '@hooks/use-roles';

export type UserFormData = {
    username: string;
    email: string;
    password: string;
    roleId: string;
    countryId: string;
    image: string;
};

const userAddSchema = Yup.object({
    username: Yup.string().required('Username is required'),
    email: Yup.string().email('Email is invalid').required('Email is required'),
    password: Yup.string().required('Password is required'),
    roleId: Yup.string().not(['0'], 'Role is required').required('Role is required'),
    countryId: Yup.string().not(['0'], 'Country is required').required('Country is required'),
    image: Yup.string().url('Image url is invalid').required('Image is required')
}).required();

type CountryItem = {
    icon: string;
    label: string;
};

const PLACEHOLDER_IMAGE = 'https://megafans.blob.core.windows.net/defaultprofiles/avatar_dinosunglasses@1x.png';

// eslint-disable-next-line react/display-name
const SelectCountryItem = forwardRef<HTMLDivElement, CountryItem>(({ icon, label, ...other }: CountryItem, ref) => (
    <Group ref={ref} {...other} spacing={8}>
        {icon && (
            <div>
                <Image
                    height={20}
                    width={20}
                    withPlaceholder
                    src={icon}
                    alt={label}
                    style={{ objectFit: 'contain' }}
                    placeholder={<MdOutlineBrokenImage size={16} />}
                />
            </div>
        )}
        <span className="mt-1">{label}</span>
    </Group>
));

type Props = {
    onSubmit: (data: UserFormData) => Promise<void>;
    user?: User;
};

export const UserForm = ({ user, onSubmit }: Props) => {
    const router = useRouter();

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
        control
    } = useForm<UserFormData>({
        mode: 'onSubmit',
        reValidateMode: 'onChange',
        resolver: yupResolver(userAddSchema),
        defaultValues: {
            username: user?.username ?? '',
            email: user?.email ?? '',
            password: user?.password ?? '',
            roleId: user?.roleId.toString() ?? '',
            countryId: user?.countryId.toString() ?? '',
            image: user?.image ?? ''
        }
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const { roles } = useRoles();
    const { countries } = useCountries();
    const {
        username: defaultUserName,
        isValidating: usernameIsValidating,
        isLoading: usernameIsLoading,
        refresh: refreshUsername
    } = useRandomUsername();

    const formatedCountries = useMemo(
        () =>
            countries?.map((country) => ({
                value: country.id.toString(),
                label: country.name,
                flag: country.flag
            })) || [],
        [countries]
    );

    const onCancel = () => {
        router.push('/users');
    };

    const onGenerateUsername = async () => {
        await refreshUsername();

        if (defaultUserName) {
            setValue('username', defaultUserName);
        }
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

    const onFormSubmit = async (data: UserFormData) => {
        setIsSubmitting(true);

        // dont like this - need to make this field to be optional to avoid this
        // currently gets a type error on resolver scope
        setValue('image', PLACEHOLDER_IMAGE);

        await onSubmit(data);

        setIsSubmitting(false);
    };

    return (
        <form id="addUser" onSubmit={handleSubmit(onFormSubmit, onError)}>
            <Stack maw={550} spacing={8}>
                <TextInput
                    {...register('username')}
                    label="Username"
                    error={errors.username && renderFormError(errors.username?.message)}
                    placeholder="john@doe.com"
                    rightSectionWidth={44}
                    rightSection={
                        <Button
                            compact
                            variant="light"
                            onClick={onGenerateUsername}
                            disabled={!usernameIsLoading && usernameIsValidating}
                        >
                            {!usernameIsLoading && usernameIsValidating ? (
                                <Loader size={14} />
                            ) : (
                                <TiArrowSync size={14} />
                            )}
                        </Button>
                    }
                />

                {!user && (
                    <PasswordInput
                        {...register('password')}
                        label="Email"
                        error={errors.password && renderFormError(errors.password?.message)}
                        placeholder="super secret password"
                    />
                )}

                <TextInput
                    {...register('email')}
                    label="Email"
                    error={errors.email && renderFormError(errors.email?.message)}
                    placeholder="john@doe.com"
                />

                {user && (
                    <TextInput
                        {...register('image')}
                        label="Image"
                        error={errors.image && renderFormError(errors.image?.message)}
                        placeholder="-"
                    />
                )}

                <Controller
                    name="roleId"
                    control={control}
                    render={({ field }) => (
                        <Select
                            {...field}
                            label="Role"
                            placeholder="Select Role"
                            error={errors.roleId && renderFormError(errors.roleId?.message)}
                            data={
                                roles?.map(({ name, id }) => ({
                                    value: id.toString(),
                                    label: name ?? 'Unknown'
                                })) ?? []
                            }
                        />
                    )}
                />

                <Controller
                    name="countryId"
                    control={control}
                    render={({ field }) => (
                        <Select
                            {...field}
                            label="Country"
                            itemComponent={SelectCountryItem}
                            placeholder="Select Country"
                            error={errors.countryId && renderFormError(errors.countryId?.message)}
                            data={
                                formatedCountries?.map(({ value, label, flag }) => ({
                                    value,
                                    label,
                                    icon: flag
                                })) ?? []
                            }
                        />
                    )}
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
                    <Button onClick={onCancel} variant="default">
                        Cancel
                    </Button>
                </Group>
            </Stack>
        </form>
    );
};
