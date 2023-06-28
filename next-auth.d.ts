import NextAuth from 'next-auth'
import { LoginDataModel } from './src/pages/api/auth/[...nextauth]'

declare module 'next-auth' {
    interface Seesion {
        user: LoginDataModel
    } 
} 