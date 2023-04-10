import Header from "./header"
import Footer from "./footer"
import type { ReactNode } from "react"

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="min-h-screen flex flex-col">
        <Header/>
        <main className="flex-1 pt-16">{children}</main>
        <Footer />
     </div>
    </>
  )
}
