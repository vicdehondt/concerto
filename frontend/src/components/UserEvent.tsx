import Image from "next/image";
import styles from "@/styles/UserEvent.module.css";
import { useRouter } from "next/router";
import { Event } from "./BackendTypes";
import { environment } from "./Environment";
import { handleFetchError } from "./ErrorHandler";

function UserEvent({ event }: { event: Event}) {

  function getMonth(month: number) {
    switch (month) {
      case 0:
        return "January";
      case 1:
        return "February";
      case 2:
        return "March";
      case 3:
        return "April";
      case 4:
        return "May";
      case 5:
        return "June";
      case 6:
        return "July";
      case 7:
        return "August";
      case 8:
        return "September";
      case 9:
        return "October";
      case 10:
        return "November";
      case 11:
        return "December";
    }
  }

  const router = useRouter();

  const convertedDateAndTime: Array<string> = convertDateAndTime(event.dateAndTime);
  const date = convertedDateAndTime[0];
  const time = convertedDateAndTime[1];

  function convertDateAndTime(dateAndTime: string) {
    const convertedDateAndTime = new Date(dateAndTime);
    const year = convertedDateAndTime.getFullYear();
    const month = getMonth(convertedDateAndTime.getMonth());
    const day = convertedDateAndTime.getDate();
    const date = [[month, day].join(" "), year].join(", ");
    const time = convertedDateAndTime.toLocaleTimeString('default', { hour: '2-digit', minute: '2-digit' });
    return [date, time];
  }

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
        <Image style={{ objectFit: "cover" }} src={event.eventPicture} width={75} height={75} alt="Picture of the event"/>
      </div>
      <div className={styles.information}>
        <div className={styles.title}>
        <div onClick={(clickEvent) => redirectClicked(clickEvent, `/concerts/${event.eventID}`)}> {event.title} </div>
        </div>
        <div className={styles.location}>
        <Image src="/icons/location.png" width={18} height={21} alt=""/>
          <div> 
            {event.Venue.venueName}
          </div>
        </div>
      </div>
      <div className={styles.dateContainer}>
        <Image src="/icons/date.png" width={35} height={35} alt="Date" />
        <div className={styles.dateAndTimeContainer}>
          <div className={styles.date}>
            {date}
          </div>
          <div className={styles.time}>
            {time}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserEvent;
