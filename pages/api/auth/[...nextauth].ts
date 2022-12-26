import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import GithubProvider from "next-auth/providers/github"
import TwitterProvider from "next-auth/providers/twitter"
import Auth0Provider from "next-auth/providers/auth0"
import CredentialsProvider from "next-auth/providers/credentials"
import { Session } from "inspector"
// import AppleProvider from "next-auth/providers/apple"
// import EmailProvider from "next-auth/providers/email"

const prisma: any = {};
const bcrypt: any = {};


// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options
export const authOptions: NextAuthOptions = {
  // https://next-auth.js.org/configuration/providers/oauth
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: "Credentials",
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.

      credentials: {
        username: { label: "Username", type: "text", placeholder: "jsmith" },
        password: {  label: "Password", type: "password" },
      },

      async authorize(credentials, req) {
        // Add logic here to look up the user from the credentials supplied

        const user = { id_test: 1, name: "J Smith", email: "jsmith@ex.com", image: "MealPlanner/suqkcwqrvwoag1july5l", info: "testinfo", 
          userRole: "admin", dietPreference: "Vegan" }

        
        if(credentials?.username=="test@gmail.com" && credentials?.password=="hello123"){
          return user
          // {
          //   name: user.name,
          //   email: user.email,
          //   id_test: user.id_test,
          //   info: "test info from...next auth",
          //   image: user.image,
          //   id: 1,
          //   userRole: "admin"
          // }
        }
        else{
          throw new Error("Username or Password doesn't match");
          //return null;
        }
        return null;
      }
    }),
    /* EmailProvider({
         server: process.env.EMAIL_SERVER,
         from: process.env.EMAIL_FROM,
       }),
    // Temporarily removing the Apple provider from the demo site as the
    // callback URL for it needs updating due to Vercel changing domains

    Providers.Apple({
      clientId: process.env.APPLE_ID,
      clientSecret: {
        appleId: process.env.APPLE_ID,
        teamId: process.env.APPLE_TEAM_ID,
        privateKey: process.env.APPLE_PRIVATE_KEY,
        keyId: process.env.APPLE_KEY_ID,
      },
    }),
    */
    /*FacebookProvider({
      clientId: process.env.FACEBOOK_ID,
      clientSecret: process.env.FACEBOOK_SECRET,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),*/
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
    /*TwitterProvider({
      clientId: process.env.TWITTER_ID,
      clientSecret: process.env.TWITTER_SECRET,
    }),
    Auth0Provider({
      clientId: process.env.AUTH0_ID,
      clientSecret: process.env.AUTH0_SECRET,
      issuer: process.env.AUTH0_ISSUER,
    }),*/



    // CredentialsProvider({
    //   name: 'Credentials',
    //   credentials: {
    //     username: { label: 'Username', type: 'text' },
    //     password: { label: 'Password', type: 'password' }
    //   },

    //   async authorize(credentials) {
    //     const user = await prisma.user.findUnique({
    //       where: {
    //         username: credentials?.username
    //       }
    //     });
        

    //     if (!user) {
    //       return null;
    //     }

    //     const valid = await bcrypt.compare(credentials?.password, user.password);

    //     if (!valid) {
    //       console.log(`Credentials not valid`);
    //       return null;
    //     }

    //     if (user) {
    //       return { ...user, email: user.username };
    //     }
    //     return null;
    //   }
    // })




  ],
  theme: {
    colorScheme: "light",
  },
  callbacks: {
    async jwt({token, user}) {
      //token.userRole = "user"
      user && (token.user = user, token.userRole = user.userRole)
      //console.log(token)
      return token
    },
    async session({session, user, token}) {
      //session.user.info = "testttttt"
      //console.log(session.user.info)
      session.user = token.user
      return session
    }
  },
session: {
  strategy: 'jwt',
}
}

export default NextAuth(authOptions)
