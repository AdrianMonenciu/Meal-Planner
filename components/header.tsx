import Link from "next/link"
import { signIn, signOut, useSession } from "next-auth/react"
import styles from "./header.module.css"
import { Image } from "cloudinary-react";

// The approach used in this component shows how to build a sign in and sign out
// component that works on pages which support both client and server side
// rendering, and avoids any flash incorrect content on initial page load.
export default function Header() {
  const { data: session, status } = useSession()
  const loading = status === "loading"

  return (
    <header>
      <noscript>
        <style>{`.nojs-show { opacity: 1; top: 0; }`}</style>
      </noscript>
      <div className={styles.signedInStatus}>
        <p
          className={`nojs-show ${
            !session && loading ? styles.loading : styles.loaded
          }`}
        >
          {!session && (
            <>
              <span className={styles.notSignedInText}>
                You are not signed in
              </span>
              <span className="flex justify-end">
                <a
                  href={`/user/login`} ///api/auth/signin
                  className={styles.buttonPrimary}
                  // onClick={(e) => {
                  //   e.preventDefault()
                  //   signIn()
                  // }}
                >
                  Sign in
                </a>
                <a
                  href={`/user/register`}
                  className={styles.buttonPrimary}
                >
                  Register
                </a>
              </span>
            </>
          )}
          {session?.user && (
            <>
              {session.user.image && (
                <>
                  {/*<span
                    style={{ backgroundImage: `url('${session.user.image}')` }}
                    className={styles.avatar}
              />*/}
                  <Image
                    className={styles.avatar}
                    cloudName={process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}
                    publicId={session.user.image}
                    alt={session.user.image}
                    secure
                    dpr="auto"
                    quality="auto"
                    width={200}
                    height={200}
                    crop="fill"
                    gravity="auto"
                  />
                </>
              )}
              <span className={styles.signedInText}>
                <small>Signed in as</small>
                <br />
                <strong>{`${session.user.email ?? session.user.username}, Role: ${session.user.userRole}` }</strong>
              </span>
              <span className="flex justify-end">
                <a
                  href={`/api/auth/signout`}
                  className={styles.button}
                  onClick={(e) => {
                    e.preventDefault()
                    signOut()
                  }}
                >
                  Sign out
                </a>
                <a
                  href={`/user/update`}
                  className={styles.button}
                >
                  Update
                </a>
              </span>  
            </>
          )}
        </p>
      </div>
      <nav>
        <ul className={styles.navItems}>
          <li className={styles.navItem}>
            <Link href="/">Home</Link>
          </li>
          <li className={styles.navItem}>
            <Link href="/example/client">Client</Link>
          </li>
          <li className={styles.navItem}>
            <Link href="/example/server">Server</Link>
          </li>
          <li className={styles.navItem}>
            <Link href="/example/protected">Protected</Link>
          </li>
          <li className={styles.navItem}>
            <Link href="/example/api-example">API</Link>
          </li>
          <li className={styles.navItem}>
            <Link href="/example/admin">Admin</Link>
          </li>
          <li className={styles.navItem}>
            <Link href="/example/me">Me</Link>
          </li>
          {session?.user.userRole == 'admin' && (
            <>
            <li className={styles.navItem}>
              <Link href="/user/updateUsers">Update Users</Link>
            </li>
            <li className={styles.navItem}>
              <Link href="/meal/foodItem">Add food</Link>
            </li>
            <li className={styles.navItem}>
              <Link href="/meal/updatefoodItems">Update food</Link>
            </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  )
}
