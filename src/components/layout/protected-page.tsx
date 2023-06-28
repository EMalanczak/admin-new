import { Center, Loader } from '@mantine/core';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

type Props = {
    children: React.ReactElement;
};

/*
  add the requireAuth property to the page component
  to protect the page from unauthenticated users
  e.g.:
  OrderDetail.requireAuth = true;
  export default OrderDetail;
 */

function isExpired(data: string) {
    return Math.floor(new Date().getTime() / 1000) >= Math.floor(new Date(data).getTime() / 1000);
}

export const ProtectedPage = ({ children }: Props): JSX.Element => {
    const router = useRouter();
    const { status: sessionStatus, data } = useSession();
    const authorized = sessionStatus === 'authenticated';
    const unAuthorized = sessionStatus === 'unauthenticated';
    const loading = sessionStatus === 'loading';

    useEffect(() => {
        // check if the session is loading or the router is not ready
        if (loading || !router.isReady) return;

        if (data?.expires && isExpired(data?.expires)) {
            console.log('session expired');
            router.push({
                pathname: '/auth/login',
                query: { returnUrl: router.asPath }
            });
        }

        // if the user is not authorized, redirect to the login page
        // with a return url to the current page
        if (unAuthorized) {
            console.log('not authorized');
            router.push({
                pathname: '/auth/login',
                query: { returnUrl: router.asPath }
            });
        }
    }, [loading, unAuthorized, sessionStatus, router]);

    // if the user refreshed the page or somehow navigated to the protected page
    if (loading) {
        return (
            <Center style={{ height: '100vh' }}>
                <Loader />
            </Center>
        );
    }

    // if the user is authorized, render the page
    // otherwise, render nothing while the router redirects him to the login page
    return authorized ? <div>{children}</div> : <div />;
};
