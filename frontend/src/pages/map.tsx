import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import SideBar from "../components/SideBar";
import dynamic from 'next/dynamic';
import type { Venue } from '@/components/VenueMap'
import { useEffect, useState } from "react";

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

export default function Map() {
  const [venues, setVenues] = useState([]);
  const [[longitude, latitude], setLocation] =  useState([50.845, 4.35])

  function showVenues(response: Array<Venue>) {
    const VenueMap = dynamic(() => import("@/components/VenueMap"), {
      ssr: false,
    })
    return <VenueMap venues={response} longitude={longitude} latitude={latitude}/>
  }

  function errorFunction() {
    console.log("Unable to retrieve your location.");
  }

  function successFunction(position: GeolocationPosition) {
    setLocation([position.coords.latitude, position.coords.longitude]);
  }

  useEffect(() => {
    fetch(environment.backendURL + "/venues", {
      mode: "cors",
      credentials: "include",
    })
      .then((response) => {
        return response.json();
      })
      .then((responseJSON) => {
        setVenues(responseJSON);
        navigator.geolocation.getCurrentPosition(successFunction, errorFunction);
      });
  }, []);

  return (
    <>
      <Head>
        <title>Concerto</title>
        <meta name="description" content="Welcome to the Concerto home page!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <div className={[styles.page, styles.homePage].join(" ")}>
          <SideBar type="event" />
          <div className={styles.pageContent}>
            {showVenues(venues)}
          </div>
        </div>
      </main>
    </>
  );
}
