import { encode as base64_encode } from 'base-64';
import NextAuth, { AuthOptions } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';

import { API_URL, APP_GAME_UID, api } from '@lib/api';

export interface LoginDataModel {
    token: string;
    refresh: string;
    username: string;
    image: string;

    /** @format int64 */
    userId: number;
    sms: boolean;
}

export interface RefreshDataModel {
    token: string;
    refresh: string;
}

type ApiResponse<T> = {
    data: T;
    success: boolean;
    message: string;
};

function getTokenExpiryDate(token: string) {
    const expiry = JSON.parse(atob(token.split('.')[1])).exp;

    return expiry * 1000;
}

function isTokenExpired(token: any) {
    return Math.floor(new Date().getTime()) >= getTokenExpiryDate(token);
}

async function refreshAccessToken(tokenObject: JWT) {
    try {
        const { data } = await api.post<ApiResponse<RefreshDataModel>>(
            `${API_URL}/Authorization/refresh`,
            { refresh: tokenObject.refreshToken, token: tokenObject.token },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        const { data: tokens, success } = data;

        if (!success) {
            return {
                ...tokenObject,
                error: 'RefreshAccessTokenError'
            };
        }

        return {
            ...tokenObject,
            token: tokens.token,
            refreshToken: tokens.refresh,
            tokenExpiry: getTokenExpiryDate(tokens.token)
        };
    } catch (error) {
        return {
            ...tokenObject,
            error: 'RefreshAccessTokenError'
        };
    }
}

export const nextAuthOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            // The name to display on the sign in form (e.g. "Sign in with...")
            name: 'Credentials',
            // `credentials` is used to generate a form on the sign in page.
            // You can specify which fields should be submitted, by adding keys to the `credentials` object.
            // e.g. domain, username, password, 2FA token, etc.
            // You can pass any HTML attribute to the <input> tag through the object.
            credentials: {
                email: { label: 'Email', type: 'text', placeholder: 'jsmith' },
                password: { label: 'Password', type: 'password' }
            },
            async authorize(credentials) {
                // Add logic here to look up the user from the credentials supplied
                const encodedString = base64_encode(`${credentials?.email}:${credentials?.password}`);
                try {
                    const { data } = await api.post<ApiResponse<LoginDataModel>>(
                        `${API_URL}/Authorization/login?appGameUid=${APP_GAME_UID}`,
                        JSON.stringify(credentials),
                        {
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Basic ${encodedString}`
                            }
                        }
                    );
                    const { data: user, success } = data;

                    if (!success) {
                        return null;
                    }

                    if (user) {
                        // Any object returned will be saved in `user` property of the JWT
                        return {
                            ...user,
                            id: `${user.userId}`,
                            name: user.username,
                            accessToken: user.token,
                            tokenExpiry: getTokenExpiryDate(user.token)
                        };
                    }
                    // If you return null then an error will be displayed advising the user to check their details.
                    return null;
                } catch (error) {
                    // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
                    console.log(error);
                    return null;
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.accessToken = (user as any).accessToken;
                token.refreshToken = (user as any).refresh;
                token.tokenExpiry = (user as any).tokenExpiry;
                token.user = {
                    id: user.id,
                    name: user.name,
                    image: user.image
                };
            }

            if (token.accessToken && !isTokenExpired(token.accessToken)) {
                return token;
            }

            return refreshAccessToken(token);
        },
        async session({ session, token }) {
            // @ts-ignore
            session.user = token.user;
            // @ts-ignore
            session.refreshToken = token.refreshToken;
            // @ts-ignore
            session.tokenExpiry = token.tokenExpiry;
            // @ts-ignore
            session.accessToken = token.accessToken;
            // @ts-ignore
            session.error = token.error;
            // console.log({ session });

            return session;
        }
    },
    pages: {
        signIn: '/auth/login'
    },
    jwt: {
        maxAge: 60 * 60 // 1 hour
    }
};

export default NextAuth(nextAuthOptions);
