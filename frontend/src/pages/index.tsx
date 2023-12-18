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
  const [filters, setFilters] = useState<Filter>({
    venueID: null,
    date: null,
    genre: null,
    minPrice: null,
    maxPrice: null,
  });
  const [sidebarSearching, setSidebarSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [inThisWeek, setInThisWeek] = useState(true);

  function filterFetch(url: string) {
    if (filters.venueID != null || filters.date != null) {
      for (const [key, value] of Object.entries(filters)) {
        if (value != null) {
          url += `&${key}=${value}`;
        }
      }
    }
    if (filters.genre != null) {
      for (const genre of filters.genre) {
        url += `&genre=${genre}`;
      }
    }
    if (filters.minPrice != null && filters.maxPrice != null) {
      url += `&price=${filters.minPrice}/${filters.maxPrice}`;
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

  useEffect(() => {
    if (sidebarSearching) {
      let url = environment.backendURL + `/search/events/filter?title=${encodeURIComponent(searchQuery)}`;
      filterFetch(url);
    } else {
      fetch(environment.backendURL + "/auth/status", {
        mode: "cors",
        credentials: "include",
      }).then((response) => {
        if (response.status == 200) {
          let url = environment.backendURL + "/events?";
          filterFetch(url);
        } else {
          let url = environment.backendURL + `/search/events/filter?`;
          filterFetch(url);
        }
      });
    }
  }, [filters, searchQuery, sidebarSearching]);

  useEffect(() => {
    if (filters.date) {
      const currentWeekday = (new Date().getDay() + 6) % 7;
      const daysLeftInWeek = 7 - (currentWeekday + 1);
      const selectedLower = filters.date < new Date();
      const inThisWeek =
        !selectedLower &&
        filters.date <= new Date(new Date().setDate(new Date().getDate() + daysLeftInWeek));
      setInThisWeek(inThisWeek);
    } else {
      setInThisWeek(true);
    }
  }, [filters]);

  useEffect(() => {
    convertEventsToHTML(events);
  }, [events]);

  useEffect(() => {
    fetch(environment.backendURL + `/events?genre`, {
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
    const eventsArray = events.map((event: Event) => {
      return (
        <EventCard
          key={event.eventID}
          eventId={event.eventID}
          title={event.title}
          location={event.Venue.venueName}
          amountAttending={event.amountCheckedIn}
          dateAndTime={event.dateAndTime}
          price={event.price}
          image={event.eventPicture}
          genre1={event.baseGenre}
          genre2={event.secondGenre}
        />
      );
    });
    setEventsHTML(eventsArray);
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
          <SideBar
            type="event"
            filters={filters}
            filterCallback={(filter: Filter) => setFilters(filter)}
            searchCallback={(searching: boolean) => setSidebarSearching(searching)}
            queryCallback={(query: string) => setSearchQuery(query)}
          />
          <div className={styles.pageContent}>
            <div className={styles.headerBox}>
              {!sidebarSearching && inThisWeek && <h1>Events this week you may like</h1>}
              {!sidebarSearching && !inThisWeek && (
                <h1>
                  Events on{" "}
                  {filters.date?.toLocaleString("en-US", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </h1>
              )}
              {sidebarSearching && <h1>Results for: {searchQuery}</h1>}
              <Link href="/map">Map View</Link>
            </div>
            <div className={styles.eventCardContainer}>{eventsHTML}</div>
          </div>
        </div>
      </main>
    </>
  );
}
