import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import Navbar from "../components/Navbar";
import EventCard from "../components/EventCard";
import SideBar from "../components/SideBar";
import { Nav } from "react-bootstrap";
import type { InferGetServerSidePropsType, GetServerSideProps } from "next";
import { ReactNode, useEffect, useState } from "react";

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
  support: string;
  doors: string;
  main: string;
  baseGenre: string;
  secondGenre: string;
  price: number;
  banner: string;
  eventPicture: string;
  artistID: string;
  venueID: string;
};

export default function Home() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [events, setEvents] = useState([]);
  const [eventsHTML, setEventsHTML] = useState<ReactNode[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const eventsArray = await Promise.all(
        events.map(async (event: Event) => {
          const response = await fetch(
            environment.backendURL + `/venues/${event.venueID}`,
            {
              mode: "cors",
              credentials: "include",
            }
          );
          const jsonResponse = await response.json();
          return (
            <EventCard
              loggedIn={loggedIn}
              key={event.eventID}
              eventId={event.eventID}
              title={event.title}
              location={jsonResponse.venueName}
              amountAttending={event.checkedIn}
              dateAndTime={event.dateAndTime}
              price={event.price}
              image={event.eventPicture}
              genre1={event.baseGenre}
              genre2={event.secondGenre}
            />
          );
        })
      );

      setEventsHTML(eventsArray);
    };
    fetchData();
  }, [events, loggedIn]);

  useEffect(() => {
    fetch(environment.backendURL + "/events", {
      mode: "cors",
      credentials: "include",
    })
      .then((response) => {
        return response.json();
      })
      .then((responseJSON) => {
        setEvents(responseJSON);
      });
    fetch(environment.backendURL + "/auth/status", {
      mode: "cors",
      credentials: "include",
    })
      .then((response) => {
        if (response.status == 200) {
          setLoggedIn(true)
        } else if (response.status == 400) {
          setLoggedIn(false)
        }
      });
  }, []);

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
            <div className={styles.eventCardContainer}>
              {eventsHTML}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
