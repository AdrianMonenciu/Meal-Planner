// Read more at: https://next-auth.js.org/getting-started/typescript#module-augmentation

import NextAuth from "next-auth"

  declare module "next-auth" {
    interface Session {
      user: {
        _id?: Schema.Types.ObjectId;
        email?: string
        username?: string
        userRole?: string
        noDiet?: boolean
        dietPreference?: string[]
        password?: string;
        image?: string;
      }
    }

    export interface User {
      _id: Schema.Types.ObjectId;
      email?: string
      username?: string
      userRole?: string
      noDiet?: boolean
      dietPreference?: string[]
      password?: string;
      image?: string;
    }

  interface JWT {
    /** The user's role. */
    userRole?: string
  }
}