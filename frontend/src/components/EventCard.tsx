import Image from "next/image";
import styles from "@/styles/EventCard.module.css";
import Tag from "@/components/Tag";
import { useRouter } from "next/router";
import { environment } from "./Environment";
import { handleFetchError } from "./ErrorHandler";

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

function EventCard({
  eventId,
  title,
  location,
  amountAttending,
  dateAndTime,
  price,
  image,
  genre1,
  genre2,
}: {
  eventId: number;
  title: string;
  location: string;
  amountAttending: number;
  dateAndTime: string;
  price: number;
  image: string;
  genre1: string;
  genre2: string;
}) {

  const router = useRouter();

  const convertedDateAndTime: Array<string> = convertDateAndTime(dateAndTime);
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

  const redirectClicked = async (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.preventDefault();
    const newUrl = await redirectURL(`/concerts/${eventId}`);
    router.push(newUrl);
  };

  return (
    <div key={eventId} className={styles.eventCard}>
      <div className={styles.photo}>
        <Image
          src={image}
          style={{ objectFit: "cover" }}
          width={120}
          height={120}
          alt="Performer"
        />
      </div>
      <div className={styles.event}>
        <div onClick={(event) => redirectClicked(event)} className={styles.performance}>
          {title}
        </div>
        <div className={styles.location}>
          <Image src="/icons/location.png" width={18} height={21} alt="" />
          <div>{location}</div>
        </div>
      </div>
      <div className={styles.tickets}>
        <div className={styles.photo}>
          <Image src="/icons/crowd.png" width={18} height={17} alt="People attending" />
        </div>
        <div>{amountAttending}</div>
      </div>
      <div className={styles.info}>
        <div className={styles.calendar}>
          <div className={styles.photo}>
            <Image src="/icons/date.png" width={38} height={41} alt="Date" />
          </div>
          <div className={styles.dateAndTime}>
            <div className={styles.date}>{date}</div>
            {/* <div className={styles.time}>18:00 &ndash; 22:00</div> */}
            <div className={styles.time}>{time}</div>
          </div>
        </div>
        <div className={styles.price}>
          <div className={styles.photo}>
            <Image src="/icons/price.png" width={20} height={18} alt="Price" />
          </div>
          {/* <div>100 &ndash; 200 EUR</div> */}
          <div>{price} EUR</div>
        </div>
      </div>
      <div className={styles.tags}>
        <div className={styles.divider}></div>
        <Tag text={genre1} />
        <Tag text={genre2} />
      </div>
    </div>
  );
}

export default EventCard;
