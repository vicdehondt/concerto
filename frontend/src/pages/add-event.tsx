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
import Timetable from "@/components/Timetable";

const inter = Inter({ subsets: ["latin"] });

const environment = {
  backendURL: "http://localhost:8080",
};
if (process.env.NODE_ENV == "production") {
  environment.backendURL = "https://api.concerto.dehondt.dev";
}

export default function AddEvent() {
  const router = useRouter();
  const title = "Concerto | Add a concert" + router.query.concert;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    var formData = new FormData(event.currentTarget);
    const form_values = Object.fromEntries(formData);
    console.log(form_values);
    const response = await fetch(environment.backendURL + "/events", {
      method: "POST",
      body: formData,
      mode: "cors",
      credentials: "include",
    });

    // Handle response if necessary
    const data = await response.json();
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
        <form className={[styles.page, styles.addEventPage].join(" ")} onSubmit={onSubmit}>
          <div className={styles.bannerContainer}>
            <BannerUpload />
          </div>
          <div className={styles.descriptionContainer}>
            <div className={styles.descriptionTitle}>Description</div>
            <div className={styles.descriptionText}>
              <textarea id="description" name="description" rows={10} required />
            </div>
          </div>
          <div className={styles.programContainer}>
            <div className={styles.programTitle}>Program</div>
            <div className={styles.programText}>
              <Timetable doorTime="19:00" supportTime="20:00" concertTime="21:00" />
            </div>
            <div className={styles.ticketsAndWishlist}>
              <button className={styles.ticketsButton}>Buy tickets</button>
              <div className={styles.addToWishlist}>
                <Image src="/icons/heart.png" width={50} height={50} alt="Add to wishlist" />
              </div>
            </div>
          </div>
          <div className={styles.ratingContainer}>
            <Rating />
          </div>
          <div className={styles.friendInviteContainer}>
            <FriendInvites />
          </div>
        </form>
      </main>
    </>
  );
}
