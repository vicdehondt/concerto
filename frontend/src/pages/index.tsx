import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import Navbar from "../components/Navbar";
import EventCard from "../components/EventCard";
import SideBar from "../components/SideBar";
import { NextPageContext } from 'next';
import { useEffect } from "react";

const inter = Inter({ subsets: ["latin"] });

const environment = {
  backendURL: "http://localhost:8080",
};

if (process.env.NODE_ENV === "production") {
  environment.backendURL = "https://api.concerto.dehondt.dev";
}

type Event = {
  eventID: number;
  title: string;
  description: string;
  maxPeople: number;
  datetime: string;
  price: number;
  image: string;
};

Home.getInitialProps = async (ctx: NextPageContext) => {
  const res = await fetch(environment.backendURL + "/events", {
    mode: 'cors',
    credentials: 'include',
  });
  const events = await res.json();
  return { events };
};

interface HomeProps {
  events: Array<Event>;
}

export default function Home(props: HomeProps) {
  function showEvent(event: Event) {
    return (
      <EventCard
        key={event.eventID}
        eventId={event.eventID}
        title={event.title}
        location="Placeholder"
        amountAttending={event.maxPeople}
        dateAndTime={event.datetime}
        price={event.price}
        image={event.image}
      />
    );
  }

  function showEvents() {
    return props.events.map(showEvent);
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
          <SideBar type="event" />
          <div className={styles.pageContent}>
            <div className={styles.title}>
              <h1>Events this week you may like</h1>
            </div>
            <div className={styles.eventCardContainer}>{showEvents()}</div>
          </div>
        </div>
      </main>
    </>
  );
};
