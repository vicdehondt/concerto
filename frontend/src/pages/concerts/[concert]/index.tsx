import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { useRouter } from "next/router";
import FriendInvites from "@/components/FriendInvite";
import Banner from "@/components/Banner";
import Rating from "@/components/Rating";
import Timetable from "@/components/Timetable";
import { useEffect, useState } from "react";
import { FormEvent } from "react";
import { Heart, Pencil } from "lucide-react";
import Link from "next/link";
import { Event } from "@/components/BackendTypes";
import { environment } from "@/components/Environment";
import dynamic from "next/dynamic";

const inter = Inter({ subsets: ["latin"] });

export default function Concert() {
  const router = useRouter();

  const [concert, setConcert] = useState<Event | null>(null);

  const [artistScore, setArtistScore] = useState(0);
  const [venueScore, setVenueScore] = useState(0);
  const [checkedIn, setCheckedIn] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [canEdit, setCanEdit] = useState(false);

  function showBanner() {
    if (concert && concert?.eventID > 0) {
      return <Banner imageSource={concert?.banner} concertName={concert?.title} />;
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
        })
        .then((responseJSON) => {
          if (responseJSON.errors) {
            if (responseJSON.errors[0].msg == "Event with that ID does not exist.") {
              router.push("/404");
            }
          } else {
            setConcert(responseJSON);
            setCheckedIn(responseJSON.checkedIn);
            setInWishlist(responseJSON.wishlisted);
            if (responseJSON.Artist.artistID) {
              fetch(environment.backendURL + `/artists/${responseJSON.Artist.artistID}`, {
                mode: "cors",
                credentials: "include",
              })
                .then((response) => {
                  return response.json();
                })
                .then((responseJSON) => {
                  setArtistScore(responseJSON.Rating.score);
                });
            }
            if (responseJSON.Venue.venueID) {
              fetch(environment.backendURL + `/venues/${responseJSON.Venue.venueID}`, {
                mode: "cors",
                credentials: "include",
              })
                .then((response) => {
                  return response.json();
                })
                .then((responseJSON) => {
                  setVenueScore(responseJSON.Rating.score);
                });
            }
          }
        });
      fetch(environment.backendURL + `/events/${id}/auth`, {
        mode: "cors",
        credentials: "include",
      }).then((response) => {
        setCanEdit(response.status == 200);
      });
    }
  }, [router, router.query.concert]);

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
        <button type="submit" className={styles.checkinButton}>
          Checked-in!
        </button>
      );
    } else {
      return (
        <button type="submit" className={styles.checkinButton}>
          Check-in
        </button>
      );
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (checkedIn) {
      const response = await fetch(
        environment.backendURL + `/events/${router.query.concert}/checkins`,
        {
          method: "DELETE",
          mode: "cors",
          credentials: "include",
        }
      );
      if (response.status == 200) {
        setCheckedIn(false);
      }
    } else {
      const response = await fetch(
        environment.backendURL + `/events/${router.query.concert}/checkins`,
        {
          method: "POST",
          mode: "cors",
          credentials: "include",
        }
      );
      if (response.status == 200) {
        setCheckedIn(true);
      }
    }
  }

  function showHeart() {
    if (inWishlist) {
      return <Heart width={50} height={50} fill="red" />;
    }
    return <Heart width={50} height={50} />;
  }

  function addToWishlist() {
    const formData = new FormData();
    const concertID = String(concert?.eventID);
    formData.append("eventID", concertID);
    fetch(environment.backendURL + "/wishlist", {
      method: "POST",
      body: formData,
      mode: "cors",
      credentials: "include",
    }).then((response) => {
      if (response.status == 200) {
        setInWishlist(true);
      }
    });
  }

  function removeFromWishlist() {
    const formData = new FormData();
    const concertID = String(concert?.eventID);
    formData.append("eventID", concertID);
    fetch(environment.backendURL + "/wishlist", {
      method: "DELETE",
      body: formData,
      mode: "cors",
      credentials: "include",
    }).then((response) => {
      if (response.status == 200) {
        setInWishlist(false);
      }
    });
  }

  function showMap() {
    if (concert && concert?.Venue.venueID) {
      const ConcertMap = dynamic(() => import("@/components/ConcertMap"), {
        ssr: false,
      });
      return <ConcertMap concert={concert} />;
    }
  }

  function showFriendInvites() {
    if (concert && concert.eventID) {
      if (new Date(concert.dateAndTime) < new Date()) {
        return null;
      }
      return <FriendInvites eventID={concert.eventID} />;
    }
  }

  return (
    <>
      <Head>
        <title>{"Concerto | " + (concert && concert.title)}</title>
        <meta name="description" content="Concert page." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <div className={[styles.page, styles.concertPage].join(" ")}>
          <div className={styles.bannerContainer}>{showBanner()}</div>
          <div className={styles.descriptionContainer}>
            <div className={styles.descriptionTitle}>Description</div>
            <div className={styles.descriptionText}>{concert?.description}</div>
          </div>
          <div className={styles.timeAndDateContainer}>
            <div className={styles.programContainer}>
              <div className={styles.programTitle}>Program</div>
              <div className={styles.programText}>
                {concert && (
                  <Timetable
                    doorTime={convertTime(concert.doors)}
                    supportTime={convertTime(concert.support)}
                    concertTime={convertTime(concert.main)}
                  />
                )}
              </div>
              <div className={styles.ticketsAndWishlist}>
                {concert && (
                  <Link href={concert.url} className={styles.ticketsButton}>
                    Buy tickets
                  </Link>
                )}
                <div
                  className={styles.addToWishlist}
                  onClick={(event) => {
                    if (inWishlist) {
                      removeFromWishlist();
                    } else {
                      addToWishlist();
                    }
                  }}
                >
                  {showHeart()}
                </div>
              </div>
              <form onSubmit={onSubmit}>{showCheckIn()}</form>
            </div>
            <div>
              <div className={styles.dateContainer}>
                <div className={styles.dateTitle}>Date</div>
                <div className={styles.datePane}>
                  {concert &&
                    new Date(concert.dateAndTime).toLocaleString("en-US", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                </div>
              </div>
            </div>
            <div className={styles.priceContainer}>
              Price
              <div className={styles.priceBox}>
                {concert && concert.price}
                {" EUR"}
              </div>
            </div>
          </div>
          <div>
            <div className={styles.editBox}>
              {canEdit && (
                <Link href={`/concerts/${concert?.eventID}/edit`}>
                  <Pencil size={50} />
                </Link>
              )}
            </div>
            <div className={styles.ratingContainer}>
              {concert && (
                <Rating
                  artistScore={artistScore}
                  venueScore={venueScore}
                  artist={concert.Artist}
                  venue={concert.Venue}
                />
              )}
            </div>
          </div>
          <div className={styles.friendInviteContainer}>{showFriendInvites()}</div>
          <div className={styles.map}>{showMap()}</div>
        </div>
      </main>
    </>
  );
}
