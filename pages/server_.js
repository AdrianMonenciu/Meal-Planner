import { unstable_getServerSession } from "next-auth/next"
import { authOptions } from "./api/auth/[...nextauth]"
import Layout from "../components/layout"
import { getToken } from "next-auth/jwt"

//import type { GetServerSidePropsContext } from "next"
//import type { Session } from "next-auth"

export default function ServerSidePage({sessionObj, jwt }) {
  // As this page uses Server Side Rendering, the `session_test` will be already
  // populated on render without needing to go through a loading stage.

  if (sessionObj) {
    console.log(sessionObj)
  } else {
    console.log("Session undefined!")
  }
  console.log(JSON.stringify(sessionObj, null, 2))
  console.log(jwt)

  
  return (
    <Layout>
      <h1>Server Side Rendering</h1>
      <p>
        This page uses the <strong>unstable_getServerSession()</strong> method
        in <strong>getServerSideProps()</strong>.
      </p>
      <p>
        Using <strong>unstable_getServerSession()</strong> in{" "}
        <strong>getServerSideProps()</strong> is the recommended approach if you
        need to support Server Side Rendering with authentication.
      </p>
      <p>
        The advantage of Server Side Rendering is this page does not require
        client side JavaScript.
      </p>
      <p>
        The disadvantage of Server Side Rendering is that this page is slower to
        render.
      </p>
      <pre>{JSON.stringify(sessionObj, null, 2)}</pre>
      <pre>{JSON.stringify(jwt, null, 2)}</pre>
    </Layout>
  )
}

// Export the `session_test` prop to use sessions with Server Side Rendering
export async function getServerSideProps({req, res}) {
  // const session = await unstable_getServerSession(
  //   context.req,
  //   context.res,
  //   authOptions
  // )
  // if (session) {
  //   console.log(session)
  // } else {
  //   console.log("Session not received")
  // })
  return {
    props: {
      sessionObj: await unstable_getServerSession(
        req,
        res,
        authOptions
      ),
      jwt: await getToken({ req})
    },
  }
}
