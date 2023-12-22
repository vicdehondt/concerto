import Image from "next/image";
import { useRouter } from "next/router";
import { Event } from "./BackendTypes";
import { environment } from "./Environment";
import Link from "next/link";
import styles from "@/styles/EventMarker.module.css";
import { handleFetchError } from "./ErrorHandler";

// Shows a card of an event to be placed in a popupo of a marker on the map.
export default function EventMarker({ event }: { event: Event }) {
  const router = useRouter();

  async function loggedIn() {
    try {
      const response = await fetch(environment.backendURL + "/auth/status", {
        mode: "cors",
        credentials: "include",
      });

      return response.ok;
    } catch (error) {
      handleFetchError(error, router);
    }
  }

  // Redirects the user to the login page if they are not logged in.
  // Otherwise, the user is redirected to the normalURL.
  async function redirectURL(normalURL: string) {
    const userLoggedIn = await loggedIn();
    if (userLoggedIn) {
      return normalURL;
    }
    return `/login?from=${encodeURIComponent(normalURL)}`;
  }

  async function redirectClicked(event: React.MouseEvent<HTMLButtonElement, MouseEvent>, url: string) {
    event.preventDefault();
    const newUrl = await redirectURL(url);
    router.push(newUrl);
  }

  return (
    <div className={styles.markerContainer}>
      <Image
        style={{ objectFit: "cover" }}
        src={event.eventPicture}
        width={50}
        height={50}
        alt="Picture of the event"
      />
      <div className={styles.infoContainer}>
        <p>{event.title}</p>
        <p>
          {new Date(event.dateAndTime).toLocaleString("en-US", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
        <button onClick={(clickEvent) => redirectClicked(clickEvent, `/concerts/${event.eventID}`)}>Go to event</button>
      </div>
    </div>
  );
}
