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
import { handleFetchError } from "@/components/ErrorHandler";

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
  const [eventPictureError, setEventPictureError] = useState<string | null>(null);
  const [artistError, setArtistError] = useState<string | null>(null);
  const [venueError, setVenueError] = useState<string | null>(null);
  const [addError, setAddError] = useState<string | null>(null);

  function concatDateAndTime() {
    const dateAndTime = date + "T" + time;
    return dateAndTime;
  }

  function eventPictureChosen(form: FormData) {
    const eventPicture: File = form.get("eventPicture") as File;
    if (eventPicture.name == "") {
      setEventPictureError("Event picture is required.");
      return false
    }
    setEventPictureError(null);
    return true;
  }

  function artistSelected() {
    if (selectedArtist == null) {
      setArtistError("Artist is required.");
      return false;
    }
    setArtistError(null);
    return true;
  }

  function venueSelected() {
    if (location == null) {
      setVenueError("Location is required.");
      return false;
    }
    setVenueError(null);
    return true;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    var formData = new FormData(event.currentTarget);
    if (artistSelected() && eventPictureChosen(formData) && venueSelected()) {
      formData.append("dateAndTime", concatDateAndTime());
      if (location) {
        formData.append("venueID", location.venueID);
      }
      if (selectedArtist) {
        formData.append("artistID", selectedArtist.id);
      }
      try {
        const response = await fetch(environment.backendURL + "/events", {
          method: "POST",
          body: formData,
          mode: "cors",
          credentials: "include",
        });

        const data = await response.json();
        if (!response.ok && data.message == "This event already exists so a new one could not be created.") {
          setAddError("This event already exists, so a new one could not be created.");
        } else {
          router.push("/");
        }
      } catch (error) {
        handleFetchError(error, router);
      }
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
              <textarea id="description" name="description" maxLength={1000} rows={10} required />
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
            {eventPictureError && <div className={styles.error}>{eventPictureError}</div>}
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
            {venueError && <div className={styles.error}>{venueError}</div>}
            <ArtistAndLocationUpload
              locationCallback={(venue: Venue) => setLocation(venue)}
              artist={selectedArtist}
              artistCallback={(artist: Artist) => setSelectedArtist(artist)}
              error={artistError}
            />
          </div>
          <div className={styles.priceContainer}>
            Tickets
            <div className={styles.priceBox}>
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
                  onClick={(event) => event.currentTarget.select()}
                  placeholder="https://example.com"
                  pattern="https://.*"
                  required
                />
              </div>
            </div>
          </div>
          <div className={styles.addEventButton}>
            {addError && <div className={styles.error}>{addError}</div>}
            <button className={styles.submitButton} type="submit">
              Add event!
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
