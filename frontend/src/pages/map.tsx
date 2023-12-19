import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import SideBar from "@/components/SideBar";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Filter, Event } from "@/components/BackendTypes";
import { environment } from "@/components/Environment";

const inter = Inter({ subsets: ["latin"] });

export default function Map() {
  const [events, setEvents] = useState<Event[]>([]);
  const [[longitude, latitude], setLocation] = useState([50.845, 4.35]);
  const [sidebarSearching, setSidebarSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Filter>({
    venueID: null,
    date: null,
    genre: null,
    minPrice: null,
    maxPrice: null,
  });

  function showEvents(events: Array<Event>) {
    const VenueMap = dynamic(() => import("@/components/VenueMap"), {
      ssr: false,
    });
    return <VenueMap events={events} />;
  }

  function errorFunction() {
    console.log("Unable to retrieve your location.");
  }

  function successFunction(position: GeolocationPosition) {
    setLocation([position.coords.latitude, position.coords.longitude]);
  }

  useEffect(() => {
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
    fetch(environment.backendURL + "/events?limit=15&offset=0", {
      mode: "cors",
      credentials: "include",
    })
      .then((response) => {
        return response.json();
      })
      .then((responseJSON) => {
        setEvents(responseJSON);
        navigator.geolocation.getCurrentPosition(successFunction, errorFunction);
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
        <div className={[styles.page, styles.mapPage].join(" ")}>
          <SideBar
            type="event"
            filters={filters}
            filterCallback={(filter: Filter) => setFilters(filter)}
            searchCallback={(searching: boolean) => setSidebarSearching(searching)}
            queryCallback={(query: string) => setSearchQuery(query)}
          />
          <div className={styles.pageContent}>{showEvents(events)}</div>
        </div>
      </main>
    </>
  );
}
