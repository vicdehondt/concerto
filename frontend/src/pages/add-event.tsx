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


export default function AddEvent({event}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const title = "Concerto | Add a concert" + router.query.concert;

  return (
    <>
      <Head>
        <title>Concerto | Add a concert</title>
        <meta name="description" content="Add a concert." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <form className={[styles.page, styles.concertPage].join(" ")}>
          <div className={styles.bannerContainer}>
            <input id='banner' name='banner' type="file" required />
          </div>
          <div className={styles.descriptionContainer}>
            <div className={styles.descriptionTitle}>
              Description
            </div>
            <div className={styles.descriptionText}>
              <textarea id='description' name='description' required />
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
        </form>
      </main>
    </>
  );
}
