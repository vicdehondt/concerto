import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '../styles/Navbar.module.css'
import Link from 'next/link'

function Navbar() {
  return (
    <div className={styles.navbar}>
      <div className={styles.leftTopics}>
        <Link href="/">Concerto</Link>
        <div className={styles.search}>
          <div className={styles.searchContainer}>
            <div className={styles.searchBar}>
              Search...
            </div>
          </div>
        </div>
        <div className={styles.addEvent}>
          <Link href="/add-event">+</Link>
        </div>
      </div>
      <div className={styles.rightTopics}>
        <Link href="/friends">Friends</Link>
        <Link href="/wishlist">Wishlist</Link>
        <a>Notifications</a>
        <Link href="/account">Account</Link>
      </div>
    </div>
  )
}

export default Navbar