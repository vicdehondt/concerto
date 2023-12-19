import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { useRouter } from "next/router";
import BannerUpload from "@/components/BannerUpload";
import { useEffect, useState } from "react";
import { FormEvent } from "react";
import TimetableUpload from "@/components/TimetableUpload";
import ArtistAndLocationUpload from "@/components/ArtistAndLocationUpload";
import EventCardUpload from "@/components/EventCardUpload";
import { Event, Venue, Artist } from "@/components/BackendTypes";
import { environment } from "@/components/Environment";

const inter = Inter({ subsets: ["latin"] });

function getFormattedDate(date: Date) {
  return [
    date.getFullYear(),
    date.getMonth() + 1, // getMonth starts at 0, so January is 00
    date.getDate(),
  ].join("-");
}

export default function EditEvent() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState<Venue | null>(null);
  const [time, setTime] = useState("");
  const [date, setDate] = useState(getFormattedDate(new Date()));
  const [price, setPrice] = useState(0);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  const [concert, setConcert] = useState<Event | null>(null);

  useEffect(() => {
    const id = router.query.concert;
    if (id) {
      fetch(environment.backendURL + `/events/${id}/auth`, {
        mode: "cors",
        credentials: "include",
      }).then((response) => {
        if (response.status == 200) {
          fetch(environment.backendURL + `/events/${id}`, {
            mode: "cors",
            credentials: "include",
          })
            .then((response) => {
              return response.json();
            })
            .then((responseJSON) => {
              setConcert(responseJSON);
              setSelectedArtist(responseJSON.Artist);
              setTitle(responseJSON.title);
              setPrice(responseJSON.price);
              setDate(responseJSON.dateAndTime.split("T")[0]);
              const time = new Date(responseJSON.dateAndTime);
              const currentTimezoneTime = time.toLocaleString();
              const convertedTime =
                currentTimezoneTime.split(" ")[1].split(":")[0] +
                ":" +
                currentTimezoneTime.split(" ")[1].split(":")[1];
              setTime(convertedTime);
            });
        } else {
          router.push("/404");
        }
      });
    }
  }, [router, router.query.concert]);

  function concatDateAndTime() {
    const dateAndTime = date + "T" + time;
    return dateAndTime;
  }

  function clearSameFields(form: FormData) {
    if (concert) {
      Array.from(form.keys()).forEach((key) => {
        if (key == "artistID") {
          if (form.get(key) == concert.Artist.artistID) {
            form.delete(key);
          }
        } else if (key == "venueID") {
          if (form.get(key) == concert.Venue.venueID) {
            form.delete(key);
          }
        } else if (key == "mainGenre") {
          if (form.get(key) == concert.baseGenre) {
            form.delete(key);
          }
        } else if (key == "dateAndTime") {
          const formDate = new Date(form.get(key) as string);
          const isoFormDate = formDate.toISOString();
          if (isoFormDate == concert.dateAndTime) {
            form.delete(key);
          }
        } else {
          const eventKey = key as keyof Event;
          if (form.get(key) == concert[eventKey]) {
            form.delete(key);
          }
        }
      });
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    var formData = new FormData(event.currentTarget);
    formData.append("dateAndTime", concatDateAndTime());
    if (location) {
      formData.append("venueID", location.venueID);
    }
    const banner: File = formData.get("banner") as File;
    const eventPicture: File = formData.get("eventPicture") as File;
    if (banner.name === "") {
      formData.delete("banner");
    }
    if (eventPicture.name === "") {
      formData.delete("eventPicture");
    }
    if (selectedArtist) {
      if (selectedArtist.id) {
        formData.append("artistID", selectedArtist.id);
      }
    }
    clearSameFields(formData);

    if (concert) {
      const response = await fetch(environment.backendURL + `/events/${concert.eventID}`, {
        method: "PATCH",
        body: formData,
        mode: "cors",
        credentials: "include",
      });

      const data = await response.json();
      if (response.status == 200 && concert) {
        router.push(`/concerts/${concert?.eventID}`);
      } else if (response.status == 400) {
        setEditError(data.message);
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
            <BannerUpload
              title={concert?.title}
              banner={concert?.banner}
              titleCallback={(string: string) => setTitle(string)}
            />
          </div>
          <div className={styles.descriptionContainer}>
            <div className={styles.descriptionTitle}>Description</div>
            <div className={styles.descriptionText}>
              <textarea
                id="description"
                name="description"
                defaultValue={concert?.description}
                maxLength={1000}
                rows={10}
                required
              />
            </div>
          </div>
          <div className={styles.inputContainer}>
            <div className={styles.programAndDateContainer}>
              <div className={styles.programContainer}>
                <div className={styles.programTitle}>Program</div>
                <div className={styles.programText}>
                  <TimetableUpload
                    mainTime={concert?.main}
                    supportTime={concert?.support}
                    time={time}
                    setTime={(string: string) => setTime(string)}
                  />
                </div>
              </div>
              <div className={styles.dateContainer}>
                <div className={styles.dateTitle}>Pick a date!</div>
                <div className={styles.datePane}>
                  <input
                    type="date"
                    defaultValue={date || ""}
                    onChange={(event) => setDate(getFormattedDate(new Date(event.target.value)))}
                    required
                  />
                </div>
              </div>
            </div>
            <div className={styles.cardPreview}>
              {location && (
                <EventCardUpload
                  edit={true}
                  genre1={concert?.baseGenre}
                  genre2={concert?.secondGenre}
                  image={concert?.eventPicture}
                  title={title}
                  location={location}
                  date={date}
                  time={time}
                  price={price}
                />
              )}
            </div>
          </div>
          <div className={styles.artistAndLocationContainer}>
            {concert && selectedArtist && (
              <ArtistAndLocationUpload
                venueID={concert.Venue.venueID}
                artist={selectedArtist}
                locationCallback={(venue: Venue) => setLocation(venue)}
                artistCallback={(artist: Artist) => setSelectedArtist(artist)}
              />
            )}
          </div>
          <div className={styles.priceContainer}>
            Tickets
            <div className={styles.priceBox}>
              <div className={styles.priceInput}>
                <input
                  type="number"
                  name="price"
                  id="price"
                  defaultValue={concert?.price}
                  placeholder="Minimum price"
                  onChange={(event) => setPrice(event.target.value as unknown as number)}
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
                  defaultValue={concert?.url}
                  onClick={(event) => event.currentTarget.select()}
                  placeholder="https://example.com"
                  pattern="https://.*"
                  required
                />
              </div>
            </div>
          </div>
          <div className={styles.addEventButton}>
            {editError && <div className={styles.error}>{editError}</div>}
            <button className={styles.submitButton} type="submit">
              Save edited event
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
