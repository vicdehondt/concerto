import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import EventCard from "@/components/EventCard";
import SideBar from "@/components/SideBar";
import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { Event, Filter, Profile } from "@/components/BackendTypes";
import { environment } from "@/components/Environment";
import isEqual from "lodash/isEqual";
import { handleFetchError } from "@/components/ErrorHandler";
import { useRouter } from "next/router";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const router = useRouter();
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

  // Fetch the events while filtering or searching.
  useEffect(() => {
    function filterFetch(url: string) {
      if (filters.venueID != null) {
        url += `&venueID=${filters.venueID}`;
      }
      if (filters.date != null && (filters.date as unknown as string) != "Invalid Date") {
        url += `&date=${filters.date}`;
      }
      if (filters.genre != null) {
        for (const genre of filters.genre) {
          url += `&genre=${genre}`;
        }
      }
      if (filters.minPrice != null && filters.maxPrice != null) {
        url += `&price=${filters.minPrice}/${filters.maxPrice}`;
      }
      try {
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
      } catch (error) {
        handleFetchError(error, router);
      }
    }
    if (sidebarSearching) {
      let url = environment.backendURL + `/search/events?title=${encodeURIComponent(searchQuery)}`;
      filterFetch(url);
    } else {
      try {
        fetch(environment.backendURL + "/auth/status", {
          mode: "cors",
          credentials: "include",
        }).then((response) => {
          if (response.status == 200) {
            const noFilters = {
              venueID: null,
              date: null,
              genre: null,
              minPrice: null,
              maxPrice: null,
            };
            if (isEqual(filters, noFilters)) {
              try {
                fetch(environment.backendURL + "/profile", {
                  mode: "cors",
                  credentials: "include",
                })
                  .then((response) => {
                    if (response.status == 200) {
                      return response.json();
                    }
                  })
                  .then((responseJSON: Profile) => {
                    let url =
                      environment.backendURL +
                      `/events?genre=${responseJSON.firstGenre}&genre=${responseJSON.secondGenre}`;
                    filterFetch(url);
                  });
              } catch (error) {
                handleFetchError(error, router);
              }
            } else {
              let url = environment.backendURL + `/events?`;
              filterFetch(url);
            }
          } else {
            let url = environment.backendURL + `/search/events?`;
            filterFetch(url);
          }
        });
      } catch (error) {
        handleFetchError(error, router);
      }
    }
  }, [filters, searchQuery, sidebarSearching]);

  // Check if the date is in this week.
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
