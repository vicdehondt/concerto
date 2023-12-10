import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import Link from "next/link";
import Navbar from "../components/Navbar";
import { FormEvent, ReactNode, useEffect, useState } from "react";
import EventCard from "@/components/EventCard";

const inter = Inter({ subsets: ["latin"] });

const environment = {
  backendURL: "http://localhost:8080",
};
if (process.env.NODE_ENV == "production") {
  environment.backendURL = "https://api.concerto.dehondt.dev";
}

type Wish = {
  wishlistID: number,
  userID: number,
  createdAt: string,
  updatedAt: string,
  Event: {
    eventID: number,
    title: string;
    amountCheckedIn: number;
    dateAndTime: string;
    baseGenre: string;
    secondGenre: string;
    price: number;
    eventPicture: string;
    venueID: string;
  }
}

type Event = {
  eventID: number,
  title: string;
  amountCheckedIn: number;
  dateAndTime: string;
  baseGenre: string;
  secondGenre: string;
  price: number;
  eventPicture: string;
  venueID: string;
};

export default function Wishlist() {

  const [events, setEvents] = useState<Event[]>([]);
  const [eventsHTML, setEventsHTML] = useState<ReactNode[]>([]);

  useEffect(() => {
    fetch(environment.backendURL + "/wishlist", {
      mode: "cors",
      credentials: "include",
    })
      .then((response) => {
        if (response.status == 200) {
          return response.json();
        }
        return [];
      })
      .then((responseJSON) => {
        setEvents(getEvents(responseJSON));
      });
  }, []);

  function getEvents(wishes: Array<Wish>) {
    return wishes.map((wish) => wish.Event);
  }

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
              loggedIn={true}
              key={event.eventID}
              eventId={event.eventID}
              title={event.title}
              location={jsonResponse.venueName}
              amountAttending={event.amountCheckedIn}
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
  }, [events]);

  return (
    <>
      <Head>
        <title>Concerto | Wishlist</title>
        <meta name="description" content="Your wishlist." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <div className={[styles.page, styles.wishlistPage].join(" ")}>
          <div className={styles.header}>
            Wishlist
          </div>
          <div className={styles.wishContainer}>
            {eventsHTML}
          </div>
        </div>
      </main>
    </>
  );
}
