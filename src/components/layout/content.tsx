import { Stack } from '@mantine/core';

import { ContentHeader } from './content-header';

type Props = {
    children?: React.ReactNode;
    label: string;
    headerChildren?: React.ReactNode;
};

const SPACING = 16;

export const Content = ({ children, label, headerChildren }: Props) => (
    <Stack
        spacing={SPACING}
        style={{
            height: '100%'
        }}
    >
        <ContentHeader label={label}>{headerChildren}</ContentHeader>
        {children}
    </Stack>
);
