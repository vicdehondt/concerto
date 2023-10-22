import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "@/styles/Concert.module.css";
import Navbar from "../../components/Navbar";
import { useRouter } from "next/router";

// Testing
import FriendInvites from "@/Components/FriendInvite";
import Banner from "@/Components/Banner"

const inter = Inter({ subsets: ["latin"] });

export default function Event() {
  const router = useRouter();
  const title = "Concerto | " + router.query.event;
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Concert page." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <div className={styles.gridContainer}>
          <Navbar />
          <div className={styles.bannerContainer}>
            <Banner imageSource="/photos/banner.jpg" concertName="Ariana Grande"/>
          </div>
          <div className={styles.descriptionContainer}>
            <div className={styles.descriptionTitle}>
              Description
            </div>
          </div>
          <div className={styles.timetableContainer}>
          </div>
          <div className={styles.ratingContainer}>
          </div>
          <div className={styles.friendInviteContainer}>
            <FriendInvites />
          </div>
        </div>
        {/* <div className={styles.gridContainer}>
          <Navbar />
          <SideBar type="event"/>
          <div className={styles.pageContent}>
            <div className={styles.title}>
              <h1>Events this week you may like</h1>
            </div>
            <div className={styles.eventCardContainer}>
              <EventCard />
            </div>
          </div>
        </div> */}
      </main>
    </>
  );
}
