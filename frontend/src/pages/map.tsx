import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import SideBar from "@/components/SideBar";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Filter, Event, Profile } from "@/components/BackendTypes";
import { environment } from "@/components/Environment";
import isEqual from "lodash/isEqual";
import { handleFetchError } from "@/components/ErrorHandler";
import { useRouter } from "next/router";

const inter = Inter({ subsets: ["latin"] });

export default function Map() {
  const router = useRouter();
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

  function successFunction(position: GeolocationPosition) {
    setLocation([position.coords.latitude, position.coords.longitude]);
  }

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
      const fetchProfile = async () => {
        try {
          const response = await fetch(environment.backendURL + "/profile", {
            mode: "cors",
            credentials: "include",
          });
          if (response.ok) {
            const data = await response.json();
            let url =
              environment.backendURL + `/events?genre=${data.firstGenre}&genre=${data.secondGenre}`;
            filterFetch(url);
          }
        } catch (error) {
          handleFetchError(error, router);
        }
      };

      const loggedIn = async () => {
        try {
          const response = await fetch(environment.backendURL + "/auth/status", {
            mode: "cors",
            credentials: "include",
          });

          if (response.ok) {
            const noFilters = {
              venueID: null,
              date: null,
              genre: null,
              minPrice: null,
              maxPrice: null,
            };
            if (isEqual(filters, noFilters)) {
              fetchProfile();
            } else {
              let url = environment.backendURL + `/events?`;
              filterFetch(url);
            }
          } else {
            let url = environment.backendURL + `/search/events?`;
            filterFetch(url);
          }

          return response.ok;
        } catch (error) {
          handleFetchError(error, router);
        }
      };
      loggedIn();
    }
  }, [filters, searchQuery, sidebarSearching]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(environment.backendURL + "/events?limit=15&offset=0", {
          mode: "cors",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setEvents(data);
          navigator.geolocation.getCurrentPosition(successFunction);
        }
      } catch (error) {
        handleFetchError(error, router);
      }
    };
    
    fetchEvents();
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
