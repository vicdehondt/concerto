import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { ReactNode, useEffect, useState } from "react";
import EventCard from "@/components/EventCard";
import { Event, Wish } from "@/components/BackendTypes";
import { environment } from "@/components/Environment";
import { handleFetchError } from "@/components/ErrorHandler";
import { useRouter } from "next/router";

const inter = Inter({ subsets: ["latin"] });

export default function Wishlist() {

  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsHTML, setEventsHTML] = useState<ReactNode[]>([]);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const response = await fetch(environment.backendURL + "/wishlist", {
          mode: "cors",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setEvents(getEvents(data));
        } else {
          setEvents([]);
        }
      } catch (error) {
        handleFetchError(error, router);
      }
    };
    fetchWishlist();
  }, []);

  function getEvents(wishes: Array<Wish>) {
    return wishes.map((wish) => wish.Event);
  }

  useEffect(() => {
    const eventsArray = events.map((event: Event) => {
      return (
        <EventCard
          key={event.eventID}
          eventId={event.eventID}
          title={event.title}
          location={event.Venue?.venueName}
          amountAttending={event.amountCheckedIn}
          dateAndTime={event.dateAndTime}
          price={event.price}
          image={event.eventPicture}
          genre1={event.baseGenre}
          genre2={event.secondGenre}
        />
      );
    })
    setEventsHTML(eventsArray);
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
