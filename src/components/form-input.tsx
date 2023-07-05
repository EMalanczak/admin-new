import { Text } from '@mantine/core';
import { mergeRefs } from '@mantine/hooks';
import React, { FC, ForwardedRef } from 'react';
import { useFormContext, Controller } from 'react-hook-form';

export const renderFormError = (message?: string) =>
    !message ? null : (
        <Text color="red.5" size="xs" className="text-red-500 text-sm mb-2 pb-2">
            {message}
        </Text>
    );

type FormInputProps<T> = {
    component: FC<T>;
    name: string;
} & T;

// eslint-disable-next-line react/function-component-definition
function RenderInput<T extends {} = {}>(
    { component: InputComponent, name, ...inputProps }: FormInputProps<T>,
    forwardedRef: ForwardedRef<any>
) {
    const {
        control,
        formState: { errors, touchedFields },
        trigger
    } = useFormContext();

    return (
        <Controller
            name={name}
            control={control}
            render={({ field: { onChange, ref, ...fieldRest } }) => (
                <InputComponent
                    miw={240}
                    autoComplete="off"
                    ref={mergeRefs(ref, forwardedRef)}
                    onChange={(...values: any[]) => {
                        onChange(...values);

                        if (touchedFields[name] || errors[name]) {
                            trigger(name);
                        }
                    }}
                    error={errors[name] && renderFormError(errors[name]?.message?.toString())}
                    {...fieldRest}
                    {...(inputProps as unknown as T)}
                />
            )}
        />
    );
}

export const FormInput = React.forwardRef(RenderInput);
