import { useState } from "react";
import styles from "../styles/Rating.module.css";
import { Star } from 'lucide-react';

function Rating({score}: {score: number}) {

  const [locationStars, setLocationStars] = useState(Array.from({ length: 5 }).map((_, index) => (
    <Star key={index} onClick={() => locationStarClicked(index)} size={35} />
  )));

  const [artistStars, setArtistStars] = useState(Array.from({ length: 5 }).map((_, index) => (
    <Star key={index} onClick={() => artistStarClicked(index)} size={35} />
  )));

  function locationStarClicked(index: number) {
    const newArray = Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} onClick={() => locationStarClicked(i)} size={35} fill={i <= index ? "yellow" : "none"} />
    ));
    setLocationStars(newArray);
  }

  function artistStarClicked(index: number) {
    const newArray = Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} onClick={() => artistStarClicked(i)} size={35} fill={i <= index ? "yellow" : "none"} />
    ));
    setArtistStars(newArray);
  }

  function showScore() {
    console.log(score);
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
      <div className={styles.box}>
        <div className={styles.text}>
          Location
        </div>
        <div className={styles.stars}> {/*Moet form worden */}
          {locationStars}
        </div>
      </div>
      <div className={styles.box}>
        <div className={styles.text}>
          Artist
        </div>
        <div className={styles.stars}>
          {showScore()}
          {/* {artistStars} */}
        </div>
      </div>
    </div>
  )
}

export default Rating;