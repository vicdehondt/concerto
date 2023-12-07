import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { useRouter } from "next/router";
import { ReactNode, useEffect, useState } from "react";
import { Star } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

const environment = {
  backendURL: "http://localhost:8080",
};
if (process.env.NODE_ENV == "production") {
  environment.backendURL = "https://api.concerto.dehondt.dev";
}

type Rating = {
  score: number;
  amountOfReviews: number;
}

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

type Review = {
  reviewID: number;
  eventID: number;
  message: string;
  score: number;
  createdAt: string;
  updatedAt: string;
  ratingID: number;
  userID: number;
}

export default function Artist() {
  const router = useRouter();

  const [artist, setArtist] = useState<Artist | null>(null);
  const [reviews, setReviews] = useState([]);
  const [reviewsHTML, setReviewsHTML] = useState<ReactNode[]>([]);

  useEffect(() => {
    if (router.isReady) {
      fetch(environment.backendURL + `/artists/${router.query.artist}`, {
        mode: "cors",
        credentials: "include",
      })
        .then((response) => {
          if (response.status === 200) {
            return response.json();
          }
          return null;
        })
        .then((responseJSON) => {
          setArtist(responseJSON);
        });
      fetch(environment.backendURL + `/artists/${router.query.artist}/reviews`, {
        mode: "cors",
        credentials: "include",
      })
        .then((response) => {
          if (response.status === 200) {
            return response.json();
          }
          return null;
        })
        .then((responseJSON) => {
          setReviewsHTML(convertReviews(responseJSON));
        });
    }
  }, [router.isReady, router.query.artist]);

  function showScore(score: number) {
    const size = 70;
    if ((score != null) && (score > 0.5)) {
      const roundedScore = Math.round(score);
      return (Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={size} fill={i <= (roundedScore - 1) ? "yellow" : "none"} />
      )));
    } else {
      return (Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={size} fill={"none"} />
      )));
    }
  }

  function convertReviews(reviews: Array<Review>) {
    return reviews.map((review: Review) => {
      return (
        <div>
          review
        </div>
      )
    })
  }

  return (
    <>
      <Head>
        <title>Concerto | Rate {artist?.name}</title>
        <meta name="description" content={`Rate the artist! Rate ${artist?.name}`} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <div className={[styles.page, styles.artistPage].join(" ")}>
          {artist && (<h1>{artist.name}</h1>)}
          <div>
            {artist && showScore(artist.Rating.score)}
          </div>
          <div className={styles.commentBox}>
            {reviewsHTML}
          </div>
        </div>
      </main>
    </>
  );
}
