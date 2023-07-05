import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import connectMongo from '../../../database/connectdb';
import Users from "../../../models/user"
import { compare } from "bcryptjs"


// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: "Credentials",
      // The credentials is used to generate a suitable form on the sign in page.
      credentials: {
        password: {  label: "Password", type: "password" },
        email: {label: "Email", type: "text"}
      },

      async authorize(credentials, req) {
        connectMongo()

        // check user existance
        //console.log(credentials)
        const result = await Users.findOne( { email : credentials.email})
        if(!result){
          throw new Error("No user Found with Email Please Sign Up...!")
        }

        // compare()
        const checkPassword = await compare(credentials.password, result.password);
        
        // incorrect password
        if(!checkPassword || result.email !== credentials.email){
          throw new Error("Password doesn't match") //JSON.stringify({ errors: "Username or Password doesn't match", status: false }));
        }
        //console.log(result)

        return result;
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  ],
  theme: {
    colorScheme: "light",
  },
  callbacks: {
    async jwt({token, user}) {
      user && (token.user = user, token.userRole = user.userRole)
      //console.log(token)
      return token
    },
    async session({session, user, token}) {
      session.user = token.user
      return session
    }
  },
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/user/login',
  }
}

export default NextAuth(authOptions)