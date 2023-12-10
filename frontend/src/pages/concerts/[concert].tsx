import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { useRouter } from "next/router";
import FriendInvites from "@/components/FriendInvite";
import Banner from "@/components/Banner";
import Rating from "@/components/Rating";
import Timetable from "@/components/Timetable";
import Image from "next/image";
import { useEffect, useState } from "react";
import { FormEvent } from "react";

const inter = Inter({ subsets: ["latin"] });

const environment = {
  backendURL: "http://localhost:8080",
};
if (process.env.NODE_ENV == "production") {
  environment.backendURL = "https://api.concerto.dehondt.dev";
}

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

type Artist = {
  artistID: string;
  name: string;
  type: string;
  ratingID: number;
  Rating: {
    score: number;
    amountOfReviews: number;
  }
};

export default function Concert() {
  const router = useRouter();
  const title = "Concerto | " + router.query.concert;

  const [concert, setConcert] = useState({
    eventID: 0,
    title: "",
    description: "",
    amountCheckedIn: 0,
    dateAndTime: "",
    price: 0,
    banner: "",
    eventPicture: "string",
    support: "99:99",
    doors: "99:99",
    main: "99:99",
    baseGenre: "ph",
    secondGenre: "ph",
    artistID: "123",
    venueID: "123",
    checkedIn: false,
  });

  const [artist, setArtist] = useState({Rating: {score: 0}})
  const [artistScore, setArtistScore] = useState(0);
  const [venueScore, setVenueScore] = useState(0);
  const [checkedIn, setCheckedIn] = useState(false);

  function showBanner() {
    if (concert.eventID > 0) {
      return <Banner imageSource={concert.banner} concertName={concert.title} />;
    }
  }

  useEffect(() => {
    const id = router.query.concert;
    if (id) {
      fetch(environment.backendURL + `/events/${id}`, {
        mode: "cors",
        credentials: "include",
      })
      .then((response) => {
        return response.json();
      }).then((responseJSON) => {
        setConcert(responseJSON);
        setCheckedIn(responseJSON.checkedIn);
        if (responseJSON.artistID) {
          fetch(environment.backendURL + `/artists/${responseJSON.artistID}`, {
            mode: "cors",
            credentials: "include",
          })
          .then((response) => {
            return response.json();
          }).then((responseJSON) => {
            setArtist(responseJSON);
            setArtistScore(responseJSON.Rating.score);
          });
        }
        if (responseJSON.venueID) {
          fetch(environment.backendURL + `/venues/${responseJSON.venueID}`, {
            mode: "cors",
            credentials: "include",
          })
          .then((response) => {
            return response.json();
          }).then((responseJSON) => {
            setVenueScore(responseJSON.Rating.score);
          });
        }
      });
    }
  }, [router.query.concert])

  function convertTime(time: string) {
    if (time !== null) {
      const hoursMinutesSeconds = time.split(":");
      return hoursMinutesSeconds[0].concat(":").concat(hoursMinutesSeconds[1]);
    }
    return null;
  }

  function showCheckIn() {
    if (checkedIn) {
      return (
        <button type="submit" className={styles.checkinButton}>Checked-in!</button>
      );
    } else {
      return (
        <button type="submit" className={styles.checkinButton}>Check-in</button>
      );
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (checkedIn) {
      const response = await fetch(environment.backendURL + `/events/${router.query.concert}/checkins`, {
        method: "DELETE",
        mode: "cors",
        credentials: "include",
      });
      if (response.status == 200) {
        setCheckedIn(false)
      }
    } else {
      const response = await fetch(environment.backendURL + `/events/${router.query.concert}/checkins`, {
        method: "POST",
        mode: "cors",
        credentials: "include",
      });
      if (response.status == 200) {
        setCheckedIn(true)
      }
    }
  }

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Concert page." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <div className={[styles.page, styles.concertPage].join(" ")}>
          <div className={styles.bannerContainer}>
            {showBanner()}
          </div>
          <div className={styles.descriptionContainer}>
            <div className={styles.descriptionTitle}>Description</div>
            <div className={styles.descriptionText}>{concert.description}</div>
          </div>
          <div className={styles.programContainer}>
            <div className={styles.programTitle}>Program</div>
            <div className={styles.programText}>
              <Timetable doorTime={convertTime(concert.doors)} supportTime={convertTime(concert.support)} concertTime={convertTime(concert.main)} />
            </div>
            <div className={styles.ticketsAndWishlist}>
              <button className={styles.ticketsButton}>Buy tickets</button>
              <div className={styles.addToWishlist}>
                <Image src="/icons/heart.png" width={50} height={50} alt="Add to wishlist" />
              </div>
            </div>
            <form onSubmit={onSubmit}>
              {showCheckIn()}
            </form>
          </div>
          <div className={styles.ratingContainer}>
            <Rating artistScore={artistScore} venueScore={venueScore} artist={concert.artistID} venue={concert.venueID} />
          </div>
          <div className={styles.friendInviteContainer}>
            <FriendInvites />
          </div>
        </div>
      </main>
    </>
  );
}
