import Link, { LinkProps } from 'next/link';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';

type Props = LinkProps & {
    href: string;
    children: ({ isActive }: { isActive: boolean }) => ReactNode;
};

export const NavLink = ({ href, children, ...rest }: Props) => {
    const { asPath } = useRouter();
    const isActive = asPath === href;

    return (
        <Link href={href} {...rest}>
            {children({ isActive })}
        </Link>
    );
};
