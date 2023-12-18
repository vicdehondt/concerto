import Image from "next/image";
import { useRouter } from "next/router";
import { Event } from "./BackendTypes";
import { environment } from "./Environment";
import Link from "next/link";

export default function EventMarker({ event }: { event: Event }) {
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
  }

  return (
    <div>
      <div>
        <Image
          style={{ objectFit: "cover" }}
          src={event.eventPicture}
          width={50}
          height={50}
          alt="Picture of the event"
        />
      </div>
      <div>
        {event.title}
        {new Date(event.dateAndTime).toLocaleString("en-US", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
        <Link href={`/concerts/${event.eventID}`}>Go to event</Link>
      </div>
    </div>
  );
}
