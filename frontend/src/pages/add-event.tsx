import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { useRouter } from "next/router";
import FriendInvites from "@/components/FriendInvite";
import BannerUpload from "@/components/BannerUpload";
import type { InferGetServerSidePropsType, GetServerSideProps } from "next";
import { useState } from "react";
import { FormEvent } from "react";
import { title } from "process";
import Image from 'next/image';
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

function getFormattedDate(date: Date) {
  return (
    [date.getFullYear(),
    date.getMonth() + 1, // getMonth starts at 0, so January is 00
    date.getDate()].join("-")
  );
}

function test(date: string) {
  console.log(new Date())
}

export default function AddEvent() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [time, setTime] = useState("")
  const [date, setDate] = useState(getFormattedDate(new Date()))

  function concatDateAndTime() {
    const dateAndTime = date + "T" + time;
    return dateAndTime;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    var formData = new FormData(event.currentTarget);
    const form_values = Object.fromEntries(formData);
    console.log(form_values);
    // const response = await fetch(environment.backendURL + "/events", {
    //   method: "POST",
    //   body: formData,
    //   mode: "cors",
    //   credentials: "include",
    // });

    // // Handle response if necessary
    // const data = await response.json();
    // if (response.status == 200) {
    //   console.log(response);
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
            <BannerUpload titleCallback={(string: string) => setTitle(string)} />
          </div>
          <div className={styles.descriptionContainer}>
            <div className={styles.descriptionTitle}>Description</div>
            <div className={styles.descriptionText}>
              <textarea id="description" name="description" rows={10} required />
            </div>
          </div>
          <div className={styles.inputContainer}>
            <div className={styles.programAndDateContainer} >
              <div className={styles.programContainer}>
                <div className={styles.programTitle}>Program</div>
                <div className={styles.programText}>
                  <TimetableUpload setTime={(string: string) => setTime(string)} />
                </div>
              </div>
              <div className={styles.dateContainer}>
                <div className={styles.dateTitle}>Pick a date!</div>
                <div className={styles.datePane}>
                  <input type="date" name="date" id="date" defaultValue={date} onChange={(event) => setDate(getFormattedDate(new Date(event.target.value)))} required />
                </div>
              </div>
            </div>
            <div className={styles.cardPreview}>
              <EventCardUpload title={title} location="Placeholder" date={date} time={time} price={20} image="/public/photos/Rombout.jpeg" />
            </div>
          </div>
          <div className={styles.artistAndLocationContainer}>
            <ArtistAndLocationUpload locationCallback={(string: string) => setLocation(string)} />
          </div>
          <div className={styles.friendInviteContainer}>
            <FriendInvites />
          </div>
          <div className={styles.addEventButton}>
            <button className={styles.submitButton} type="submit">Add event!</button>
          </div>
        </form>
      </main>
    </>
  );
}
