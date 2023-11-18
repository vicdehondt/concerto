import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { useRouter } from "next/router";
import FriendInvites from "@/components/FriendInvite";
import Banner from "@/components/Banner";
import Rating from "@/components/Rating";
import type { InferGetServerSidePropsType, GetServerSideProps } from "next";
import Timetable from "@/components/Timetable";
import Image from "next/image";
import { useEffect, useState } from "react";

const inter = Inter({ subsets: ["latin"] });

const environment = {
  backendURL: "http://localhost:8080",
};
if (process.env.NODE_ENV == "production") {
  environment.backendURL = "https://api.concerto.dehondt.dev";
}

type Event = {
  eventID: number;
  title: string;
  description: string;
  checkedIn: number;
  dateAndTime: string;
  price: number;
  banner: string;
  eventPicture: string;
};

export default function Concert() {
  const router = useRouter();
  const title = "Concerto | " + router.query.concert;

  const [concert, setConcert] = useState({
    eventID: 0,
    title: "",
    description: "",
    checkedIn: 0,
    dateAndTime: "",
    price: 0,
    banner: "",
    eventPicture: "string",
  });

  function showBanner() {
    if (concert.eventID > 0) {
      return <Banner imageSource={concert.banner} concertName={concert.title} />;
    }
  }

  useEffect(() => {
    const id = router.query.concert;
    if (id) {
      fetch(environment.backendURL + `/events/${id}`, {
        mode: "cors",
        credentials: "include",
      })
      .then((response) => {
        return response.json();
      }).then((responseJSON) => {
        setConcert(responseJSON);
      });
    }
  }, [router.query.concert])

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Concert page." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <div className={[styles.page, styles.concertPage].join(" ")}>
          <div className={styles.bannerContainer}>
            {showBanner()}
          </div>
          <div className={styles.descriptionContainer}>
            <div className={styles.descriptionTitle}>Description</div>
            <div className={styles.descriptionText}>{concert.description}</div>
          </div>
          <div className={styles.programContainer}>
            <div className={styles.programTitle}>Program</div>
            <div className={styles.programText}>
              <Timetable doorTime="19:00" supportTime="20:00" concertTime="21:00" />
            </div>
            <div className={styles.ticketsAndWishlist}>
              <button className={styles.ticketsButton}>Buy tickets</button>
              <div className={styles.addToWishlist}>
                <Image src="/icons/heart.png" width={50} height={50} alt="Add to wishlist" />
              </div>
            </div>
          </div>
          <div className={styles.ratingContainer}>
            <Rating />
          </div>
          <div className={styles.friendInviteContainer}>
            <FriendInvites />
          </div>
        </div>
      </main>
    </>
  );
}
