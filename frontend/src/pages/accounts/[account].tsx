import Head from "next/head";
import { useRouter } from "next/router";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { useEffect, useState } from "react";
import Biography from "@/components/Biography";
import UserEvent from "@/components/UserEvent";
import { Event, User } from "@/components/BackendTypes";
import { environment } from "@/components/Environment";

const inter = Inter({ subsets: ["latin"] });

export default function Account() {
  const [user, setUser] = useState<User | null>(null);
  const [checkedevents, setcheckedEvents] = useState([]);
  const [attendedevents, setAttendedEvents] = useState([]);
  const [checkedInPrivacy, setCheckedInPrivacy] = useState(true)

  const router = useRouter();

  function requestCheckins(user: User) {
    console.log(user.userID);
    fetch(environment.backendURL + "/users" + `/${user.userID}/checkins`, {
      mode: "cors",
      credentials: "include",
  }).then((response) => {
      if (response.status == 200) {
        return response.json();
      } else {
        setCheckedInPrivacy(false);
        return null;
      }
    }).then((responseJSON) => {
      if (responseJSON != null) {
        setcheckedEvents(responseJSON);
      }
    });
  }

  function requestAttended(user: User) {
    fetch(environment.backendURL + "/users" + `/${user.userID}/attended`, {
      mode: "cors",
      credentials: "include",
  }).then((response) => {
      if (response.status == 200) {
        return response.json();
      } else {
        setCheckedInPrivacy(false);
        return null;
      }
    }).then((responseJSON) => {
      if (responseJSON != null) {
        setAttendedEvents(responseJSON)
      }
    });
  }

  function showCheckins(response: Array<Event>) {
    if (!checkedInPrivacy) {
      return (<div>
        Not allowed to see this information.
      </div>
      )
    }
    else if (response.length > 0) {
      return response.map((event: Event) => (
        <div key={event.eventID}>
          <UserEvent event={event}/>
        </div>
      ));
    } else {
      return <></>;
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
          setUser(responseJSON);
          requestCheckins(responseJSON);
          requestAttended(responseJSON);
        });
    }
  }, [router.query.account]);
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
            {user && <Biography user={user} source={user.image} username={user.username} description={user.description} />}
          </div>
          <div className={styles.attendingEvents}>
            Attending Events:
            <div className={styles.attendedEventsContainer}>
              {showCheckins(checkedevents)}
            </div>
          </div>
          <div className={styles.pastEvents}>
            Past Events:
            <div className={styles.pastEventsContainer}>
              {showCheckins(attendedevents)}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
