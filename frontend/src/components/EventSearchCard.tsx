import Image from "next/image";
import styles from "@/styles/EventSearchCard.module.css";
import { Event } from "./BackendTypes";
import Link from "next/link";

type EventSearchCardProps = {
  event: Event;
  loggedIn: boolean;
};

// Shows a card of an event to be placed in a list of search results.
function EventSearchCard({ event, loggedIn }: EventSearchCardProps) {

  // Redirects the user to the login page if they are not logged in.
  // Otherwise, the user is redirected to the normalURL.
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
