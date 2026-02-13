import NextAuth, {NextAuthOptions} from "next-auth";
import  CredentialsProvider  from "next-auth/providers/credentials";
import bcrypt from 'bcrypt'
import db from '../../../../prisma/db'

export const authOptions: NextAuthOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: {label: 'Email', type: 'email', placeholder: 'Email'},
                password: {label: 'Password', type: 'password', placeholder: 'Password'}
            },
            async authorize(credentials, request) {
                if(!credentials?.email || !credentials?.password) return null

                const user = db.prepare('SELECT * FROM User WHERE email = ?').get(credentials.email) as any

                if(!user) return null

                const passMatch = await bcrypt.compare(credentials.password, user.hashedPassword!)

                return passMatch ? { id: user.id, name: user.name, email: user.email } : null
            }
        })
    ],
    session: {
        strategy: 'jwt'
    },
    callbacks: {
        async signIn({user, account, profile}) {
            if(user)
                return true
            else
                return false
        }
    },
}

const handler = NextAuth(authOptions)

export {handler as GET, handler as POST}