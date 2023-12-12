import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { useRouter } from "next/router";
import FriendInvites from "@/components/FriendInvite";
import BannerUpload from "@/components/BannerUpload";
import { useEffect, useState } from "react";
import { FormEvent } from "react";
import Rating from '@/components/Rating'
import TimetableUpload from "@/components/TimetableUpload";
import ArtistAndLocationUpload from "@/components/ArtistAndLocationUpload";
import EventCardUpload from "@/components/EventCardUpload";

const inter = Inter({ subsets: ["latin"] });

const environment = {
  backendURL: "http://localhost:8080",
};
if (process.env.NODE_ENV == "production") {
  environment.backendURL = "https://api.concerto.dehondt.dev";
}

type Artist = {
  artistID: string;
  type: string;
  name: string;
  id: string;
};

type Venue = {
  venueID: string;
  venueName: string;
  longitude: number;
  latitude: number;
  ratingID: number;
};

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

function getFormattedDate(date: Date) {
  return (
    [date.getFullYear(),
    date.getMonth() + 1, // getMonth starts at 0, so January is 00
    date.getDate()].join("-")
  );
}

export default function EditEvent() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState({venueID: "123", venueName: "Not selected"});
  const [time, setTime] = useState("")
  const [date, setDate] = useState(getFormattedDate(new Date()))
  const [price, setPrice] = useState(0);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);

  const [concert, setConcert] = useState<Event | null>(null);

  useEffect(() => {
    const id = router.query.concert;
    if (id) {
      fetch(environment.backendURL + `/events/${id}`, {
        mode: "cors",
        credentials: "include",
      })
        .then((response) => {
          return response.json();
        })
        .then((responseJSON) => {
          setConcert(responseJSON);
          setTitle(responseJSON.title);
          setPrice(responseJSON.price);
          setDate(responseJSON.dateAndTime.split("T")[0]);
          const time = new Date(responseJSON.dateAndTime);
          const currentTimezoneTime = time.toLocaleString();
          const convertedTime = currentTimezoneTime.split(" ")[1].split(":")[0] + ":" + currentTimezoneTime.split(" ")[1].split(":")[1];
          setTime(convertedTime);
        });
    }
  }, [router.query.concert]);

  function concatDateAndTime() {
    const dateAndTime = date + "T" + time;
    return dateAndTime;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    var formData = new FormData(event.currentTarget);
    formData.append("dateAndTime", concatDateAndTime());
    formData.append("price", "20");
    formData.append("venueID", location.venueID);
    const banner: File = formData.get("eventPicture") as File;
    // if (banner.name === "") {
    //   formData.append("banner", "");
    // }
    if (selectedArtist) {
      if (selectedArtist.artistID) {
        formData.append("artistID", selectedArtist.artistID);
      }
      if (selectedArtist.id) {
        formData.append("artistID", selectedArtist.id);
      }
    }
    // console.log(concert);
    // [...formData.entries()].forEach(([key, value]) => {
    //   console.log(`${key}: ${value}`);
    // });


    // const response = await fetch(environment.backendURL + "/events", {
    //   method: "POST",
    //   body: formData,
    //   mode: "cors",
    //   credentials: "include",
    // });

    // const data = await response.json();
    // if (response.status == 200) {
    //   router.push("/")
    // }
  }

  return (
    <>
      <Head>
        <title>Concerto | Add a concert</title>
        <meta name="description" content="Add a concert." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <form className={[styles.page, styles.addEventPage].join(" ")} onSubmit={onSubmit}>
          <div className={styles.bannerContainer}>
            <BannerUpload title={concert?.title} banner={concert?.banner} titleCallback={(string: string) => setTitle(string)} />
          </div>
          <div className={styles.descriptionContainer}>
            <div className={styles.descriptionTitle}>Description</div>
            <div className={styles.descriptionText}>
              <textarea id="description" name="description" defaultValue={concert?.description} rows={10} required />
            </div>
          </div>
          <div className={styles.inputContainer}>
            <div className={styles.programAndDateContainer} >
              <div className={styles.programContainer}>
                <div className={styles.programTitle}>Program</div>
                <div className={styles.programText}>
                  <TimetableUpload mainTime={concert?.main} supportTime={concert?.support} time={time} setTime={(string: string) => setTime(string)} />
                </div>
              </div>
              <div className={styles.dateContainer}>
                <div className={styles.dateTitle}>Pick a date!</div>
                <div className={styles.datePane}>
                  <input type="date" defaultValue={date} onChange={(event) => setDate(getFormattedDate(new Date(event.target.value)))} required />
                </div>
              </div>
            </div>
            <div className={styles.cardPreview}>
              <EventCardUpload genre1={concert?.baseGenre} genre2={concert?.secondGenre} image={concert?.eventPicture} title={title} location={location.venueName} date={date} time={time} price={price} />
            </div>
          </div>
          <div className={styles.artistAndLocationContainer}>
            <ArtistAndLocationUpload venueID={concert?.venueID} artistID={concert?.artistID} locationCallback={(venue: Venue) => setLocation(venue)} artistCallback={(artist: Artist) => setSelectedArtist(artist)} />
          </div>
          <div className={styles.friendInviteContainer}>
            <FriendInvites />
          </div>
          <div className={styles.addEventButton}>
            <button className={styles.submitButton} type="submit">Save edited event</button>
          </div>
        </form>
      </main>
    </>
  );
}
