import { withAuth } from "next-auth/middleware"

// More on how NextAuth.js middleware works: https://next-auth.js.org/configuration/nextjs#middleware
export default withAuth({
  callbacks: {
    authorized({ req, token, }) {
      // `/admin` requires admin role
      // console.log("Token from middleware")
      // console.log(token)
      if (req.nextUrl.pathname === "/example/admin"|| req.nextUrl.pathname === "/user/updateUsers" ||  req.nextUrl.pathname === "/meal/foodItem"
      || req.nextUrl.pathname === "/meal/updatefoodItems" || req.nextUrl.pathname === "/meal/meal" || req.nextUrl.pathname === "/meal/updateMeals") {
        //return token?.userRole === "admin"
        return token?.userRole === "admin"
      }

      // `/me` only requires the user to be logged in
      return !!token
    },
  },
})

export const config = { matcher: ["/example/admin", "/example/me", "/example/client", "/user/update", "/user/updateUsers",
"/meal/foodItem", "/meal/updatefoodItems", "/meal/meal", "/meal/updateMeals"] }
