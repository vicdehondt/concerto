import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { useRouter } from "next/router";
import { ChangeEvent, ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { Star, User } from "lucide-react";
import Image from "next/image";

const inter = Inter({ subsets: ["latin"] });

const environment = {
  backendURL: "http://localhost:8080",
};
if (process.env.NODE_ENV == "production") {
  environment.backendURL = "https://api.concerto.dehondt.dev";
}

export default function AddRating() {
  const router = useRouter();

  // form of url `http://localhost:3000/ratings/add-rating?from=${fromURL}&venue=${venueID}&artist=${artistID}&event=${eventID}`

  const venueComment = useRef<HTMLTextAreaElement>(null);
  const artistComment = useRef<HTMLTextAreaElement>(null);

  const [venueScore, setVenueScore] = useState(0);
  const [artistScore, setArtistScore] = useState(0);
  const [scores, setScores] = useState(false);
  const [venueName, setVenueName] = useState("");
  const [artistName, setArtistName] = useState("");

  const [locationStars, setLocationStars] = useState(
    Array.from({ length: 5 }).map((_, index) => (
      <Star
        className={styles.star}
        key={index}
        onClick={() => locationStarClicked(index)}
        size={50}
      />
    ))
  );

  const [artistStars, setArtistStars] = useState(
    Array.from({ length: 5 }).map((_, index) => (
      <Star
        className={styles.star}
        key={index}
        onClick={() => artistStarClicked(index)}
        size={50}
      />
    ))
  );

  useEffect(() => {
    const venueID = router.query.venue;
    const artistID = router.query.artist;
    if (venueID) {
      fetch(environment.backendURL + `/venues/${venueID}`, {
        mode: "cors",
        credentials: "include",
      })
        .then((response) => {
          if (response.status === 200) {
            return response.json();
          }
        })
        .then((responseJSON) => {
          setVenueName(responseJSON?.venueName);
        });
    }
    if (artistID) {
      fetch(environment.backendURL + `/artists/${artistID}`, {
        mode: "cors",
        credentials: "include",
      })
        .then((response) => {
          if (response.status === 200) {
            return response.json();
          }
        })
        .then((responseJSON) => {
          setArtistName(responseJSON?.name);
        });
    }
  }, [router.query.venue, router.query.artist]);

  function locationStarClicked(index: number) {
    const newArray = Array.from({ length: 5 }).map((_, i) => (
      <Star
        className={styles.star}
        key={i}
        onClick={() => locationStarClicked(i)}
        size={50}
        fill={i <= index ? "yellow" : "none"}
      />
    ));
    setLocationStars(newArray);
    setVenueScore(index + 1);
  }

  function artistStarClicked(index: number) {
    const newArray = Array.from({ length: 5 }).map((_, i) => (
      <Star
        className={styles.star}
        key={i}
        onClick={() => artistStarClicked(i)}
        size={50}
        fill={i <= index ? "yellow" : "none"}
      />
    ));
    setArtistStars(newArray);
    setArtistScore(index + 1);
  }

  useEffect(() => {
    setScores((venueScore > 0) && (artistScore > 0));
  }, [venueScore, artistScore]);

  function updateEdit() {
    if (venueComment.current != null && artistComment.current != null) {
    }
  }

  function submitReviews() {
    const venueID = router.query.venue;
    const artistID = router.query.artist;
    const eventID = router.query.event;
    const venueForm = new FormData();
    const artistForm = new FormData();
    var submitSuccess = false;
    var venueSuccess = false;
    var artistSuccess = false;
    venueForm.append("eventID", String(eventID));
    venueForm.append("score", String(venueScore));
    artistForm.append("eventID", String(eventID));
    artistForm.append("score", String(artistScore));
    if (venueComment.current != null && venueComment.current.value != "") {
      venueForm.append("message", venueComment.current.value);
    }
    if (artistComment.current != null && artistComment.current.value != "") {
      artistForm.append("message", artistComment.current.value);
    }
    fetch(environment.backendURL + `/venues/${venueID}/reviews`, {
      method: "POST",
      body: venueForm,
      mode: "cors",
      credentials: "include",
    })
    .then((response) => {
      if (response.status == 200) {
        venueSuccess = true;
      }
    });
    fetch(environment.backendURL + `/artists/${artistID}/reviews`, {
      method: "POST",
      body: artistForm,
      mode: "cors",
      credentials: "include",
    })
    .then((response) => {
      if (response.status == 200) {
        artistSuccess = true;
      }
    });
    if (venueSuccess && artistSuccess) {
      const from = Array.isArray(router.query.from) ? router.query.from[0] : router.query.from || '/';
      router.push(from);
    }
  }

  return (
    <>
      <Head>
        <title>{`Concerto | Rate ${venueName} and ${artistName}!`}</title>
        <meta name="description" content={`Rate the venue and artist! Rate ${venueName} and ${artistName}!`} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <div className={[styles.page, styles.addRatingPage].join(" ")}>
          <div className={styles.pageHeader}>
            Rate {venueName} and {artistName}
          </div>
          <div className={styles.ratingBox}>
            <div className={styles.venueRatingBox}>
              <div className={styles.header}>
                Add rating for {venueName}
              </div>
              <div className={styles.starRating}>{locationStars}</div>
              <div className={styles.comment}>
                <textarea
                  placeholder="Add a comment"
                  onChange={(event) => updateEdit()}
                  ref={venueComment}
                />
              </div>
            </div>
            <div className={styles.artistRatingBox}>
              <div className={styles.header}>
                Add rating for {artistName}
              </div>
              <div className={styles.starRating}>{artistStars}</div>
              <div className={styles.comment}>
                <textarea
                  placeholder="Add a comment"
                  onChange={(event) => updateEdit()}
                  ref={artistComment}
                />
              </div>
            </div>
            {scores && <button onClick={(event) => submitReviews()}>Submit</button>}
          </div>
        </div>
      </main>
    </>
  );
}
