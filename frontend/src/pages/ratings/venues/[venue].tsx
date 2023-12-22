import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { useRouter } from "next/router";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { Star, User } from "lucide-react";
import Image from "next/image";
import { Review, Venue } from "@/components/BackendTypes";
import { environment } from "@/components/Environment";
import Link from "next/link";
import { handleFetchError } from "@/components/ErrorHandler";

const inter = Inter({ subsets: ["latin"] });

type ReviewWithUserInfo = Review & { username: string; image: string };

export default function Venue() {
  const router = useRouter();

  const [venue, setVenue] = useState<Venue | null>(null);
  const [reviews, setReviews] = useState<ReviewWithUserInfo[]>([]);
  const [reviewsHTML, setReviewsHTML] = useState<ReactNode[]>([]);

  const getCreated = useCallback((dateAndTime: string) => {
    const convertedDateAndTime = new Date(dateAndTime);
    const year = convertedDateAndTime.getFullYear();
    const month = getMonth(convertedDateAndTime.getMonth());
    const day = convertedDateAndTime.getDate();
    const date = [[month, day].join(" "), year].join(", ");
    const time = dateAndTime.split("T", 2)[1].split(":", 2).join(":");

    const result = "Created on " + date + " at " + time;
    return result;
  }, []);

  const convertReviews = useCallback(
    (reviews: ReviewWithUserInfo[]) => {
      return reviews.map((review) => {
        if (review.message != null) {
          return (
            <div key={review.reviewID} className={styles.reviewContainer}>
              <div className={styles.reviewHeader}>
                <div className={styles.imageBox}>{showImage(review.image, 40)}</div>
                <div className={styles.infoBox}>
                  <div className={styles.user}>{review.username}</div>
                  <div className={styles.created}>{getCreated(review.createdAt)}</div>
                </div>
              </div>
              <div className={styles.score}>{showScore(review.score, 25, styles.userStars)}</div>
              <div className={styles.review}>{review.message}</div>
            </div>
          );
        }
        return (
          <div key={review.reviewID} className={styles.reviewContainer}>
            <div className={styles.reviewHeaderNoBorder}>
              <div className={styles.imageBox}>{showImage(review.image, 40)}</div>
              <div className={styles.infoBox}>
                <Link href={`/accounts/${review.userID}`} className={styles.user}>
                  {review.username}
                </Link>
                <div className={styles.created}>{getCreated(review.createdAt)}</div>
              </div>
            </div>
            <div className={styles.scoreNoBorder}>
              {showScore(review.score, 25, styles.userStars)}
            </div>
          </div>
        );
      });
    },
    [getCreated]
  );

  useEffect(() => {


    const fetchData = async () => {
      try {
        const venueResponse = await fetch(environment.backendURL + `/venues/${router.query.venue}`, {
          mode: "cors",
          credentials: "include",
        });

        if (venueResponse.ok) {
          const venueData = await venueResponse.json();
          setVenue(venueData);
        }
      } catch (error) {
        handleFetchError(error, router);
      }

      try {
        const reviewsResponse = await fetch(environment.backendURL + `/venues/${router.query.venue}/reviews`, {
          mode: "cors",
          credentials: "include",
        });

        if (reviewsResponse.ok) {
          const reviewsData = await reviewsResponse.json();
          const reviewsWithUsernames = await Promise.all(
            reviewsData.map(async (review: Review) => {
              try {
                const userResponse = await fetch(environment.backendURL + `/users/${review.userID}`, {
                  mode: "cors",
                  credentials: "include",
                });

                if (userResponse.ok) {
                  const userData = await userResponse.json();
                  return { ...review, username: userData?.username, image: userData?.image ?? null };
                }
                return { ...review, username: 'Unknown User', image: null };
              } catch (error) {
                handleFetchError(error, router);
              }
            })
          );
          setReviews(reviewsWithUsernames);
          setReviewsHTML(convertReviews(reviewsWithUsernames))
        }
      } catch (error) {
        handleFetchError(error, router);
      }
    };

    if (router.isReady) {
      fetchData();
    }
  }, [router.isReady, router.query.artist, convertReviews, router.query.venue]);

  function showScore(score: number, size: number, styleClass: string) {
    if (score != null && score > 0.5) {
      const roundedScore = Math.round(score);
      return Array.from({ length: 5 }).map((_, i) => (
        <Star
          className={styleClass}
          key={i}
          size={size}
          fill={i <= roundedScore - 1 ? "yellow" : "none"}
        />
      ));
    } else {
      return Array.from({ length: 5 }).map((_, i) => (
        <Star className={styleClass} key={i} size={size} fill={"none"} />
      ));
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

  function showImage(imageSource: string, size: number) {
    if (imageSource == null) {
      return <User width={size} height={size} />;
    }
    return (
      <Image
        src={imageSource}
        style={{ objectFit: "cover" }}
        width={size}
        height={size}
        alt="User profile picture"
      />
    );
  }

  return (
    <>
      <Head>
        <title>{`Concerto | Ratings of ${venue?.venueName}`}</title>
        <meta name="description" content={`Rate the artist! Rate ${venue?.venueName}`} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <div className={[styles.page, styles.artistPage].join(" ")}>
          <div className={styles.pageHeader}>
            {venue && <div className={styles.artistName}>{venue.venueName}</div>}
            <div className={styles.starsBox}>
              {venue && showScore(venue.Rating.score, 70, styles.artistStar)}
            </div>
          </div>
          <div className={styles.reviewBox}>{reviewsHTML}</div>
        </div>
      </main>
    </>
  );
}
