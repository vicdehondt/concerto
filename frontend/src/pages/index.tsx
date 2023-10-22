import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Searchbar from "../components/Searchbar";
import EventCard from "../components/EventCard";
import SideBar from "../components/SideBar"

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <>
      <Head>
        <title>Concerto</title>
        <meta name="description" content="Welcome to the Concerto home page!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <div className={styles.gridContainer}>
          <Navbar />
          <SideBar type="event"/>
          <div className={styles.pageContent}>
            <div className={styles.title}>
              <h1>Events this week you may like</h1>
            </div>
            <div className={styles.eventCardContainer}>
              <EventCard title="Ariana Grande"/>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
