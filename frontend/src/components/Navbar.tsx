import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/Navbar.module.css";
import Link from "next/link";
import Searchbar from "./Searchbar";

function handleClick() {
  console.log("Test");
}

function Navbar({pictureSource}: {pictureSource: string}) {
  return (
    <nav className={styles.navbar}>
      <div className={styles.leftTopics}>
        <Link href="/">Concerto</Link>
        <Searchbar type="long" />
        <div className={styles.addEventButton}>
          <Link href="/add-event">+</Link>
        </div>
      </div>
      <div className={styles.rightTopics}>
        <Link href="/friends">Friends</Link>
        <Link href="/wishlist">Wishlist</Link>
        <a>Notifications</a>
        <div className={styles.profilePicture}>
          <Link href="/account">
            <Image src={pictureSource} width={56} height={56} alt="Profile picture"/>
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
