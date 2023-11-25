import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import Navbar from "../components/Navbar";
import EventCard from "../components/EventCard";
import SideBar from "../components/SideBar";
import { Nav } from "react-bootstrap";
import type { InferGetServerSidePropsType, GetServerSideProps } from "next";
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
  eventPicture: string;
};

export default function Home() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [events, setEvents] = useState([]);

  function showEvents(response: Array<Event>) {
    return response.map((event: Event) => {
      return (
        <EventCard
          loggedIn={loggedIn}
          key={event.eventID}
          eventId={event.eventID}
          title={event.title}
          location="Placeholder"
          amountAttending={event.checkedIn}
          dateAndTime={event.dateAndTime}
          price={event.price}
          image={event.eventPicture}
        />
      );
    });
  }

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
              {showEvents(events)}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
