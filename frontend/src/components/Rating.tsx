import styles from "@/styles/Rating.module.css";
import { Star } from 'lucide-react';
import Link from "next/link";
import { Artist, Venue } from "./BackendTypes";

type RatingProps = {
  artistScore: number,
  venueScore: number,
  artist: Artist,
  venue: Venue
}

function Rating({artistScore, venueScore, artist, venue}: RatingProps) {

  function showScore(score: number) {
    if ((score != null) && (score > 0.5)) {
      const roundedScore = Math.round(score);
      return (Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={35} fill={i <= (roundedScore - 1) ? "yellow" : "none"} />
      )));
    } else {
      return (Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={35} fill={"none"} />
      )));
    }
  }

  return (
    <div className={styles.rateBox}>
      <Link href={`/ratings/venues/${venue.venueID}`} className={styles.box}>
        <div className={styles.text}>
          {venue.venueName}
        </div>
        <div className={styles.stars}>
          {showScore(venueScore)}
        </div>
      </Link>
      <Link href={`/ratings/artists/${artist.artistID}`} className={styles.box}>
        <div className={styles.text}>
          {artist.name}
        </div>
        <div className={styles.stars}>
          {showScore(artistScore)}
        </div>
      </Link>
    </div>
  )
}

export default Rating;