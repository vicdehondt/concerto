import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import EventCard from "@/components/EventCard";
import SideBar from "@/components/SideBar";
import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { Event, Filter } from "@/components/BackendTypes";
import { environment } from "@/components/Environment";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [events, setEvents] = useState([]);
  const [eventsHTML, setEventsHTML] = useState<ReactNode[]>([]);
  const [filters, setFilters] = useState<Filter>({venueID: null, datetime: null, genre1: null});
  const [thisWeek, setThisWeek] = useState(true);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (filters.venueID != null || filters.datetime != null || filters.genre1 != null) {
      let url = environment.backendURL + "/search/events/filter?";
      for (const [key, value] of Object.entries(filters)) {
        if (value != null) {
          url += `&${key}=${value}`;
        }
      }
      fetch(url, {
        mode: "cors",
        credentials: "include",
      })
      .then((response) => {
        return response.json();
      })
      .then((responseJSON) => {
        setEvents(responseJSON);
      });
    }
  }, [filters]);

  useEffect(() => {
    convertEventsToHTML(events);
  }, [events]);

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
  }, []);

  function convertEventsToHTML(events: Array<Event>) {
    const fetchData = async () => {
      const eventsArray = await Promise.all(
        events.map(async (event: Event) => {
          const response = await fetch(
            environment.backendURL + `/venues/${event.Venue.venueID}`,
            {
              mode: "cors",
              credentials: "include",
            }
          );
          const jsonResponse = await response.json();
          return (
            <EventCard
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
  };

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
          <SideBar type="event" filters={filters} filterCallback={(filter: Filter) => setFilters(filter)} />
          <div className={styles.pageContent}>
            <div className={styles.headerBox}>
              {thisWeek && <h1>Events this week you may like</h1>}
              {searching && <h1>Results for: {"Hallo"}</h1>}
              <Link href="/map">Map View</Link>
            </div>
            <div className={styles.eventCardContainer}>{eventsHTML}</div>
          </div>
        </div>
      </main>
    </>
  );
}
