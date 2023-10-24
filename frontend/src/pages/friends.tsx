import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import Link from "next/link";
import Navbar from "../components/Navbar";
import SideBar from "../components/SideBar";
import FriendCard from "../components/FriendCard";

const inter = Inter({ subsets: ["latin"] });

export default function Friends() {
  return (
    <>
      <Head>
        <title>Concerto | Friends</title>
        <meta name="description" content="Your friends." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <div className={styles.gridContainer}>
          <SideBar type="friends" />
          <div className={styles.pageContent}>
            <div className={styles.title}>
              <h1>Friends</h1>
            </div>
            <div className={styles.friendsContainer}>
              <FriendCard source="/photos/ariana.jpeg" username="Ariana"/>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
