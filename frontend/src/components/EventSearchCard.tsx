import Image from "next/image";
import styles from "@/styles/EventSearchCard.module.css";
import { Event } from "./BackendTypes";
import { useEffect, useState } from "react";
import { environment } from "./Environment";
import Link from "next/link";

type EventSearchCardProps = {
  event: Event;
};

function EventSearchCard({ event }: EventSearchCardProps) {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    fetch(environment.backendURL + "/auth/status", {
      mode: "cors",
      credentials: "include",
    }).then((response) => {
      setLoggedIn(response.status === 200);
    });
  }, []);

  function redirectURL(normalURL: string) {
    if (loggedIn) {
      return normalURL;
    } else {
      return `/login?from=${encodeURIComponent(normalURL)}`;
    }
  }

  return (
    <div className={styles.cardContainer}>
      {event && (
        <Link
          key={event.eventID}
          href={redirectURL(`/concerts/${event.eventID}`)}
          className={styles.cardContainer}
        >
          <Image style={{objectFit: "cover"}} src={event.eventPicture} width={60} height={60} alt="Image of the event." />
          <div className={styles.info}>
            <div className={styles.name}>{event.title}</div>
            <div className={styles.location}>{event.Artist.name}</div>
            <div className={styles.location}>{event.Venue.venueName}</div>
          </div>
        </Link>
      )}
    </div>
  );
}

export default EventSearchCard;
