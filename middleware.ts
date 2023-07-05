import { withAuth } from "next-auth/middleware"

// More on how NextAuth.js middleware works: https://next-auth.js.org/configuration/nextjs#middleware
export default withAuth({
  callbacks: {
    authorized({ req, token, }) {
      if (req.nextUrl.pathname === "/example/admin"|| req.nextUrl.pathname === "/user/updateUsers") {
        return token?.userRole === "admin"
      }
      
      return !!token
    },
  },
})

export const config = { matcher: ["/example/admin", "/example/me", "/example/client", "/user/update", "/user/updateUsers",
"/meal/foodItem", "/meal/updatefoodItems", "/meal/meal", "/meal/updateMeals", "/meal/updateWeeklyPlan", "/meal/weeklyPlan"] }
