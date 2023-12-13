import Image from "next/image";
import { useRouter } from "next/router";
import { Event } from "./BackendTypes";
import { environment } from "./Environment";

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
  };

  return (
    <div>
      <div>{event.title}</div>
      <div>
        <Image src={event.eventPicture} width={50} height={50} alt="Picture of the event" />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#0B2027",
          borderRadius: "5px",
          width: 90,
        }}
      >
        <div style={{ color: "white" }} onClick={(clickEvent) => redirectClicked(clickEvent, `/concerts/${event.eventID}`)}>
          {" "}
          Go to event{" "}
        </div>
      </div>
    </div>
  );
}
