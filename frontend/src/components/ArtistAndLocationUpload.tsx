import { useState } from "react";
import styles from "../styles/ArtistAndLocationUpload.module.css";
import { Star } from 'lucide-react';

function ArtistAndLocationUpload({ locationCallback }: { locationCallback: (string: string) => void }) {


  // De locationCallback moet later gebruikt worden voor 
  return (
    <div className={styles.rateBox}>
      <div className={styles.box}>
        <div className={styles.text}>
          Location
        </div>
        <div className={styles.stars}> {/*Moet form worden */}
          Sportpaleis
        </div>
      </div>
      <div className={styles.box}>
        <div className={styles.text}>
          Artist
        </div>
        <div className={styles.stars}>
          Ariana Grande
        </div>
      </div>
    </div>
  )
}

export default ArtistAndLocationUpload;