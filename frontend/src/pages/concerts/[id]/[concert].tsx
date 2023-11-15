import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { useRouter } from "next/router";
import FriendInvites from "@/components/FriendInvite";
import Banner from "@/components/Banner"
import type { InferGetServerSidePropsType, GetServerSideProps } from 'next'
// import Timetable from "/components/Timetable";

const inter = Inter({ subsets: ["latin"] });

const environment = {
  backendURL: "http://localhost:8080"
}
if (process.env.NODE_ENV == "production") {
  environment.backendURL = "https://api.concerto.dehondt.dev"
}

type Event = {
  eventID: number
  title: string
  description: string
  maxPeople: number
  datetime: string
  price: number
  image: string
}

export const getServerSideProps = (async (context) => {
  const id = context.query.id
  const res = await fetch(environment.backendURL + `/events/${id}`);
  const event = await res.json();
  return { props: { event } }
}) satisfies GetServerSideProps<{
  event: Event
}>


export default function Concert({event}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const title = "Concerto | " + router.query.concert;

  return (
    <>
      <Head>
        {/* <title>{title}</title> */}
        <title>yoooo</title>
        <meta name="description" content="Concert page." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <div className={[styles.page, styles.concertPage].join(" ")}>
          <div className={styles.bannerContainer}>
            <Banner imageSource="/photos/banner.jpg" concertName="Ariana Grande"/>
          </div>
          <div className={styles.descriptionContainer}>
            <div className={styles.descriptionTitle}>
              Description
            </div>
            <div className={styles.descriptionText}>
            {event.description}
            </div>
          </div>
          <div className={styles.timetableContainer}>
            {/* <Timetable /> */}
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
