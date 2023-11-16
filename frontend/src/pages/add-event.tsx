import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { useRouter } from "next/router";
import FriendInvites from "@/components/FriendInvite";
import Banner from "@/components/Banner"
import type { InferGetServerSidePropsType, GetServerSideProps } from 'next'
import { useState } from "react";
import { FormEvent } from 'react'
import { title } from "process";
// import Timetable from "/components/Timetable";

const inter = Inter({ subsets: ["latin"] });

const environment = {
  backendURL: "http://localhost:8080"
}
if (process.env.NODE_ENV == "production") {
  environment.backendURL = "https://api.concerto.dehondt.dev"
}

type Event = {
  eventID: number
  title: string
  description: string
  maxPeople: number
  datetime: string
  price: number
  image: string
}

// title
// description
// price
// banner
// eventpicture
// datetime

export const getServerSideProps = (async (context) => {
  const id = context.query.id
  const res = await fetch(environment.backendURL + `/events/${id}`);
  const event = await res.json();
  return { props: { event } }
}) satisfies GetServerSideProps<{
  event: Event
}>


export default function AddEvent({event}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const title = "Concerto | Add a concert" + router.query.concert;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {

    event.preventDefault();
    var formData = new FormData(event.currentTarget);
    const form_values = Object.fromEntries(formData);
    console.log(form_values);
    const response = await fetch(environment.backendURL + "/events", {
      method: 'POST',
      body: formData,
      mode: 'cors',
      credentials: 'include',
    })

    // Handle response if necessary
    const data = await response.json()
    if (response.status == 200) {
      console.log(response);
    }
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
        <form className={[styles.page, styles.concertPage].join(" ")} onSubmit={onSubmit}>
          <div className={styles.bannerContainer}>
            <input id='banner' name='banner' type="file" required />
            <input id='eventpicture' name='eventpicture' type="file" required />
            {/* <input id='eventpicture' name='eventpicture' type="file" required /> */}
            <input type="text" name='title' id='title' required placeholder="Title" />
            <input type="text" name='price' id='price' required placeholder="Price" />
            <input className={styles.dateInput} type="datetime-local" name="datetime" id="datetime" />
          </div>
          <div className={styles.descriptionContainer}>
            <div className={styles.descriptionTitle}>
              Description
            </div>
            <div className={styles.descriptionText}>
              <textarea id='description' name='description' required />
            </div>
          </div>
          <div className={styles.timetableContainer}>
            {/* <Timetable /> */}
          </div>
          <div className={styles.ratingContainer}>
            Testing
          </div>
          <button type='submit'>Submit</button>
          <div className={styles.friendInviteContainer}>
            <FriendInvites />
          </div>
        </form>
      </main>
    </>
  );
}
