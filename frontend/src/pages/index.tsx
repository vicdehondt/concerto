import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import Navbar from "../components/Navbar";
import EventCard from "../components/EventCard";
import SideBar from "../components/SideBar"
import { Nav } from "react-bootstrap";
import type { InferGetServerSidePropsType, GetServerSideProps } from 'next'
import { useEffect } from "react";


// var cookies = require('cookies')

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
  const req = context.req;
  const res = await fetch(environment.backendURL + "/events", {
    mode: 'cors',
    credentials: 'include',
  });
  // console.log(res.cookies.get);
  // console.log(res.headers.getSetCookie());
  // console.log(cookies.get("connect.sid"));
  const events = await res.json()
  return { props: { events } }
}) satisfies GetServerSideProps<{
  events: Array<Event>
}>

export default function Home({events}: InferGetServerSidePropsType<typeof getServerSideProps>) {

  function showEvent(event: Event) {
    return <EventCard key={event.eventID} eventId={event.eventID} title={event.title} location="Placeholder" amountAttending={event.maxPeople} dateAndTime={event.datetime} price={event.price} image={event.image} />
  }

  function showEvents() {
    return events.map(showEvent);
  }

  return (
    <>
      <Head>
        <title>Concerto</title>
        <meta name="description" content="Welcome to the Concerto home page!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <div className={[styles.page, styles.homePage].join(" ")}>
          <SideBar type="event"/>
          <div className={styles.pageContent}>
            <div className={styles.title}>
              <h1>Events this week you may like</h1>
            </div>
            <div className={styles.eventCardContainer}>
              {showEvents()}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
