import Image from "next/image";
import styles from "@/styles/EventSearchCard.module.css";
import { Event } from "./BackendTypes";

type EventSearchCardProps = {
  event: Event;
}

function EventSearchCard({ event }: EventSearchCardProps) {
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
