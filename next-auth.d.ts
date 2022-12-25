// import "next-auth/jwt"

// // Read more at: https://next-auth.js.org/getting-started/typescript#module-augmentation

// declare module "next-auth/jwt" {
//   interface JWT {
//     /** The user's role. */
//     userRole?: "admin"
//   }
// }

import NextAuth from "next-auth"

//declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  // interface Session {
  //   user: {
  //     /** The user's postal address. */
  //     info: string
  //   } & DefaultSession["user"]
 // }
  declare module "next-auth" {
    export interface User {
      id_test?: number
      info?: string
      userRole?: string
      dietPreference?: string
    }
  
  // export interface Session {
  //   user: User
  //   // {
  //   //   /** The user's postal address. */
  //   //   id: number,
  //   //   info: string
  //   // }
  // }

  interface JWT {
    /** The user's role. */
    userRole?: string
  }
}