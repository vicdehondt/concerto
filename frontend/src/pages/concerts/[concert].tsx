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
            <div className={styles.descriptionText}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
            Praesent vel luctus mauris. Quisque finibus egestas elit eget laoreet. 
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
            Mauris dictum tristique nisi, viverra congue ligula dapibus et. 
            Vestibulum lacinia felis in libero efficitur convallis. 
            Fusce mauris augue, pharetra fermentum vestibulum vel, gravida id nulla. 
            Proin orci nulla, luctus quis pretium elementum, molestie convallis eros.
            </div>
          </div>
          <div className={styles.timetableContainer}>
          </div>
          <div className={styles.ratingContainer}>
            Testing
          </div>
          <div className={styles.friendInviteContainer}>
            <FriendInvites />
          </div>
        </div>
      </main>
    </>
  );
}
