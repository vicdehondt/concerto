import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { useRouter } from "next/router";
import { ReactNode, useEffect, useState } from "react";
import { Star, User } from "lucide-react";
import Image from "next/image";

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

type ReviewWithUserInfo = Review & { username: string, image: string };

export default function Artist() {
  const router = useRouter();

  const [artist, setArtist] = useState<Artist | null>(null);
  const [reviews, setReviews] = useState<ReviewWithUserInfo[]>([]);
  const [reviewsHTML, setReviewsHTML] = useState<ReactNode[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [artistResponse, reviewsResponse] = await Promise.all([
          fetch(environment.backendURL + `/artists/${router.query.artist}`, {
            mode: "cors",
            credentials: "include",
          }),
          fetch(environment.backendURL + `/artists/${router.query.artist}/reviews`, {
            mode: "cors",
            credentials: "include",
          }),
        ]);

        if (artistResponse.status === 200) {
          const artistData = await artistResponse.json();
          setArtist(artistData);
        }

        if (reviewsResponse.status === 200) {
          const reviewsData = await reviewsResponse.json();
          const reviewsWithUsernames = await Promise.all(
            reviewsData.map(async (review: Review) => {
              const userResponse = await fetch(environment.backendURL + `/users/${review.userID}`, {
                mode: "cors",
                credentials: "include",
              });

              if (userResponse.status === 200) {
                const userData = await userResponse.json();
                return { ...review, username: userData?.username, image: userData?.image ?? null };
              }
              return { ...review, username: 'Unknown User', image: null };
            })
          );
          setReviews(reviewsWithUsernames);
          setReviewsHTML(convertReviews(reviewsWithUsernames))
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (router.isReady) {
      fetchData();
    }
  }, [router.isReady, router.query.artist]);

  function showScore(score: number, size: number, styleClass: string ) {
    if ((score != null) && (score > 0.5)) {
      const roundedScore = Math.round(score);
      return (Array.from({ length: 5 }).map((_, i) => (
        <Star className={styleClass} key={i} size={size} fill={i <= (roundedScore - 1) ? "yellow" : "none"} />
      )));
    } else {
      return (Array.from({ length: 5 }).map((_, i) => (
        <Star className={styleClass} key={i} size={size} fill={"none"} />
      )));
    }
  }

  function getMonth(month: number) {
    switch (month) {
      case 0:
        return "January";
      case 1:
        return "February";
      case 2:
        return "March";
      case 3:
        return "April";
      case 4:
        return "May";
      case 5:
        return "June";
      case 6:
        return "July";
      case 7:
        return "August";
      case 8:
        return "September";
      case 9:
        return "October";
      case 10:
        return "November";
      case 11:
        return "December";
    }
  }

  function getCreated(dateAndTime: string) {
    const convertedDateAndTime = new Date(dateAndTime);
    const year = convertedDateAndTime.getFullYear();
    const month = getMonth(convertedDateAndTime.getMonth());
    const day = convertedDateAndTime.getDate();
    const date = [[month, day].join(" "), year].join(", ");
    const time = dateAndTime.split("T", 2)[1].split(":", 2).join(":");

    const result = "Created on " + date + " at " + time;
    return result;
  }

  function showImage(imageSource: string, size: number) {
    if (imageSource == null) {
      return (<User width={size} height={size} />);
    }
    return (
      <Image src={imageSource} style={{objectFit:"cover"}} width={size} height={size} alt="User profile picture" />
    );
  }

  function convertReviews(reviews: ReviewWithUserInfo[]) {
    return reviews.map((review) => {
      if (review.message != null) {
        return (
          <div key={review.reviewID} className={styles.reviewContainer}>
            <div className={styles.reviewHeader}>
              <div className={styles.imageBox}>
                {showImage(review.image, 40)}
              </div>
              <div className={styles.infoBox}>
                <div className={styles.user}>
                  {review.username}
                </div>
                <div className={styles.created}>
                  {getCreated(review.createdAt)}
                </div>
              </div>
            </div>
            <div className={styles.score}>
                {showScore(review.score, 25, styles.userStars)}
              </div>
            <div className={styles.review}>
              {review.message}
            </div>
          </div>
        );
      }
      return (
        <div key={review.reviewID} className={styles.reviewContainer}>
          <div className={styles.reviewHeaderNoBorder}>
            <div className={styles.imageBox}>
              {showImage(review.image, 40)}
            </div>
            <div className={styles.infoBox}>
              <div className={styles.user}>
              {review.username}
              </div>
              <div className={styles.created}>
                {getCreated(review.createdAt)}
              </div>
            </div>
          </div>
          <div className={styles.scoreNoBorder}>
              {showScore(review.score, 25, styles.userStars)}
            </div>
        </div>
      );
    });
  }

  return (
    <>
      <Head>
        <title>{`Concerto | Rate ${artist?.name}`}</title>
        <meta name="description" content={`Rate the artist! Rate ${artist?.name}`} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <div className={[styles.page, styles.artistPage].join(" ")}>
          <div className={styles.pageHeader}>
            {artist && (<div className={styles.artistName}>{artist.name}</div>)}
            <div className={styles.starsBox}>
              {artist && showScore(artist.Rating.score, 70, styles.artistStar)}
            </div>
          </div>
          <div className={styles.reviewBox}>
            {reviewsHTML}
          </div>
        </div>
      </main>
    </>
  );
}
