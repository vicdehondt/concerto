import Image from "next/image";
import styles from "../styles/UserEvent.module.css";
import { useEffect, useState } from "react";
import Link from "next/link";

type Event = {
  eventID: number;
  title: string;
  eventPicture: string;
};

const environment = {
  backendURL: "http://localhost:8080",
};
if (process.env.NODE_ENV == "production") {
  environment.backendURL = "https://api.concerto.dehondt.dev";
}

function UserEvent({ event }: { event: Event}) {
  const [loggedIn, setLoggedIn] = useState(false);

  function redirectURL(normalURL: string) {
    if (loggedIn) {
    return normalURL;
    }
    return `/login?from=${encodeURIComponent(normalURL)}`
}

  useEffect(() => {
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
    <div className={styles.eventCard}>
      <div className={styles.eventPicture}>
        <Image src={event.eventPicture} width={75} height={75} alt="Picture of the event"/>
      </div>
      <div className={styles.information}>
        <div className={styles.title}>
        <Link href={redirectURL(`/concerts/${event.eventID}`)}> {event.title} </Link>
        </div>
        <div className={styles.location}>
        <Image src="/icons/location.png" width={18} height={21} alt=""/>
          <div> Location </div>
        </div>
      </div>
      <div className={styles.dateContainer}>
        <Image src="/icons/date.png" width={35} height={35} alt="Date" />
        <div className={styles.date}>
          6 December
        </div>
      </div>
    </div>
  );
}

export default UserEvent;
