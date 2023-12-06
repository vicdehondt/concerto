import Head from "next/head";
import { useRouter } from "next/router";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { useEffect, useState } from "react";
import Biography from "@/components/Biography";

const inter = Inter({ subsets: ["latin"] });

const environment = {
  backendURL: "http://localhost:8080",
};
if (process.env.NODE_ENV == "production") {
  environment.backendURL = "https://api.concerto.dehondt.dev";
}

type User = {
  username: string;
  userID: number;
  mail: string;
  image: string;
  privacyAttendedEvents: string;
  privacyCheckedInEvents: string;
  privacyFriends: string;
}

type Event = {
  eventID: number;
  title: string;
  eventPicture: string;
};

export default function Account() {
  const [user, setUser] = useState({});
  const [events, setEvents] = useState([]);

  const router = useRouter();

  function requestCheckins() {
    fetch(environment.backendURL + "/users" + `/${user.username}/checkins`).then((response) => {
      return response.json();
    }).then((responseJSON) => {
      console.log(responseJSON)
      setEvents(responseJSON)
    });
  }

  function showCheckins(response: Array<Event>) {
    if (response && response.length > 0) {
      return response.map((event: Event) => (
        <div key={event.eventID}>
          {event.title}
        </div>
      ));
    } else {
      return <>hello</>;
    }
  }

  useEffect(() => {
    const id = router.query.account
    if (id) {
      fetch(environment.backendURL + "/users" + `/${id}`, {
        mode: "cors",
        credentials: "include",
      })
        .then((response) => {
          return response.json();
        })
        .then((responseJSON) => {
          setUser(responseJSON)
          requestCheckins();
        });
    }
  }, []);
  return (
    <>
      <Head>
        <title>Concerto | Account</title>
        <meta name="description" content="Your Account." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <div className={[styles.page, styles.accountPage].join(" ")}>
          <div className={styles.biographyContainer}>
            <Biography source={user.image} username={user.username} />
          </div>
          <div className={styles.attendedEventsContainer}>
            {showCheckins(events)}
          </div>
        </div>
      </main>
    </>
  );
}
