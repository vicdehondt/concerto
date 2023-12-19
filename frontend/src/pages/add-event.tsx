import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { useRouter } from "next/router";
import FriendInvites from "@/components/FriendInvite";
import BannerUpload from "@/components/BannerUpload";
import { useState } from "react";
import { FormEvent } from "react";
import TimetableUpload from "@/components/TimetableUpload";
import ArtistAndLocationUpload from "@/components/ArtistAndLocationUpload";
import EventCardUpload from "@/components/EventCardUpload";
import { Artist, Venue } from "@/components/BackendTypes";
import { environment } from "@/components/Environment";

const inter = Inter({ subsets: ["latin"] });

function getFormattedDate(date: Date) {
  const isoDate = date.toISOString();
  return isoDate.split("T")[0];
}

export default function AddEvent() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState({ venueID: "123", venueName: "Not selected" });
  const [time, setTime] = useState("");
  const [date, setDate] = useState(getFormattedDate(new Date()));
  const [price, setPrice] = useState("");
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);

  function concatDateAndTime() {
    const dateAndTime = date + "T" + time;
    return dateAndTime;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    var formData = new FormData(event.currentTarget);
    formData.append("dateAndTime", concatDateAndTime());
    formData.append("venueID", location.venueID);
    if (selectedArtist) {
      formData.append("artistID", selectedArtist.id);
    }
    const response = await fetch(environment.backendURL + "/events", {
      method: "POST",
      body: formData,
      mode: "cors",
      credentials: "include",
    });

    // Handle response if necessary
    const data = await response.json();
    if (response.status == 200) {
      router.push("/");
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
            <BannerUpload titleCallback={(string: string) => setTitle(string)} />
          </div>
          <div className={styles.descriptionContainer}>
            <div className={styles.descriptionTitle}>Description</div>
            <div className={styles.descriptionText}>
              <textarea id="description" name="description" rows={10} required />
            </div>
          </div>
          <div className={styles.inputContainer}>
            <div className={styles.programAndDateContainer}>
              <div className={styles.programContainer}>
                <div className={styles.programTitle}>Program</div>
                <div className={styles.programText}>
                  <TimetableUpload setTime={(string: string) => setTime(string)} />
                </div>
              </div>
              <div className={styles.dateContainer}>
                <div className={styles.dateTitle}>Pick a date!</div>
                <div className={styles.datePane}>
                  <input
                    type="date"
                    onChange={(event) => setDate(getFormattedDate(new Date(event.target.value)))}
                    required
                  />
                </div>
              </div>
            </div>
            <div className={styles.cardPreview}>
              <EventCardUpload
                title={title}
                location={location.venueName}
                date={date}
                time={time}
                price={price as unknown as number}
              />
            </div>
          </div>
          <div className={styles.artistAndLocationContainer}>
            <ArtistAndLocationUpload
              locationCallback={(venue: Venue) => setLocation(venue)}
              artist={selectedArtist}
              artistCallback={(artist: Artist) => setSelectedArtist(artist)}
            />
          </div>
          <div className={styles.priceContainer}>
            <div className={styles.priceBox}>
              Tickets
              <div className={styles.priceInput}>
                <input
                  type="number"
                  name="price"
                  id="price"
                  placeholder="Minimum price"
                  onChange={(event) => setPrice(event.target.value)}
                  required
                />
                EUR
              </div>
              <div className={styles.ticketURL}>
                Add site to buy tickets:
                <input
                  type="url"
                  name="url"
                  id="url"
                  placeholder="https://example.com"
                  pattern="https://.*"
                  required
                />
              </div>
            </div>
          </div>
          <div className={styles.addEventButton}>
            <button className={styles.submitButton} type="submit">
              Add event!
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
