import Image from "next/image";
import styles from "../styles/UserEvent.module.css";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

type Event = {
  eventID: number;
  title: string;
  description: string;
  amountCheckedIn: number;
  dateAndTime: string;
  support: string;
  doors: string;
  main: string;
  baseGenre: string;
  secondGenre: string;
  price: number;
  banner: string;
  eventPicture: string;
  artistID: string;
  venueID: string;
  checkedIn: boolean;
};

const environment = {
  backendURL: "http://localhost:8080",
};
if (process.env.NODE_ENV == "production") {
  environment.backendURL = "https://api.concerto.dehondt.dev";
}

function UserEvent({ event }: { event: Event}) {

  const router = useRouter();

  async function loggedIn() {
    try {
      const response = await fetch(environment.backendURL + "/auth/status", {
        mode: "cors",
        credentials: "include",
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

	async function redirectURL(normalURL: string) {
    const userLoggedIn = await loggedIn();
    if (userLoggedIn) {
      return normalURL;
    }
    return `/login?from=${encodeURIComponent(normalURL)}`;
  }

  async function redirectClicked(event: React.MouseEvent<HTMLDivElement, MouseEvent>, url: string) {
    event.preventDefault();
    const newUrl = await redirectURL(url);
    router.push(newUrl);
  };

  return (
    <div className={styles.eventCard}>
      <div className={styles.eventPicture}>
        <Image src={event.eventPicture} width={75} height={75} alt="Picture of the event"/>
      </div>
      <div className={styles.information}>
        <div className={styles.title}>
        <div onClick={(clickEvent) => redirectClicked(clickEvent, `/concerts/${event.eventID}`)}> {event.title} </div>
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
