import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "../styles/Navbar.module.css";
import Link from "next/link";
import Searchbar from "../components/Searchbar";

function handleClick() {
  console.log("Test");
}

function Navbar() {
  return (
    <div className={styles.navbar}>
      <div className={styles.leftTopics}>
        <Link href="/">Concerto</Link>
        <Searchbar type="long" />
        <div className={styles.addEvent}>
          <Link href="/add-event">+</Link>
        </div>
      </div>
      <div className={styles.rightTopics}>
        <Link href="/friends">Friends</Link>
        <Link href="/wishlist">Wishlist</Link>
        <a>Notifications</a>
        <div className={styles.profilePicture}>
          <Link href="/account">
            <Image src="/photos/Rombout.jpeg" width={56} height={56} alt="Profile picture"/>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
