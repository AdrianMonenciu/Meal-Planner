import { SessionProvider } from "next-auth/react"
//import 'tailwindcss/tailwind.css';
//import "./styles.css"
import "../styles/globals.css"
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

import type { AppProps } from "next/app"
import type { Session } from "next-auth"

// Use of the <SessionProvider> is mandatory to allow components that call
// `useSession()` anywhere in your application to access the `session` object.
export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps<{ session: Session }>) {
  return (
    <SessionProvider session={session}>
      <ToastContainer />
      <Component {...pageProps} />
    </SessionProvider>
  )
}
