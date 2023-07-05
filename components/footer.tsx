import Link from "next/link"
import styles from "./footer.module.css"

export default function Footer() {
  return (
    <footer className={`${styles.footer} bg-green-100`}>
      <hr />
      <ul className={`${styles.navItems} flex flex-row flex-wrap items-center justify-around mt-3`}>
        <li className={styles.navItem}>
          <a href="https://nextjs.org">Next JS</a>
        </li>
        <li className={styles.navItem}>
          <a href="https://next-auth.js.org">Next Auth</a>
        </li>
        <li className={styles.navItem}>
          <a href="https://www.npmjs.com/package/next-auth">NPM</a>
        </li>
        <li className={styles.navItem}>
          <a href="https://github.com/AdrianMonenciu/Meal-Planner-WIP">GitHub</a>
        </li>
        <li className={styles.navItem}>
          <a href="https://www.mongodb.com">Mongo DB</a>
        </li>
        <li className={styles.navItem}>
          <a href="https://tailwindcss.com">Tailwind</a>
        </li>
        <li className={styles.navItem}>
          <Link href="/policy">Policy</Link>
        </li>
      </ul>
    </footer>
  )
}
