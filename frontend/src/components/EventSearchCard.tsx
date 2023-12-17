import Image from "next/image";
import styles from "@/styles/EventSearchCard.module.css";
import { Event } from "./BackendTypes";
import { useEffect, useState } from "react";
import { environment } from "./Environment";

type EventSearchCardProps = {
  event: Event;
}

function EventSearchCard({ event }: EventSearchCardProps) {

  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    fetch(environment.backendURL + "/auth/status", {
      mode: "cors",
      credentials: "include",
    })
    .then((response) => {
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
      <Image src={event.eventPicture} width={20} height={20} alt="Image of the event." />
      <div className={styles.info}>
        <div className={styles.title}>{event.title}</div>
        <div className={styles.location}>{event.Venue.venueID}</div>
      </div>
    </div>
  );
}

export default EventSearchCard;
