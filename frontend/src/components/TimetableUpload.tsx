import { useState } from "react";
import styles from "../styles/TimetableUpload.module.css";

function TimetableUpload({ setTime }: { setTime: (string: string) => void }) {
  const [support, setSupport] = useState(false);

  function showSupport() {
    if (support) {
      return <input type="time" className={styles.time} name='support' id='support' required />
    }
      return <button className={styles.addSupport} onClick={(e) => setSupport(true)}>Add time</button>
  }

  return (
    <div className={styles.container}>
      <div className={styles.box}>
        <div className={styles.text}>Doors open:</div>
        <input type="time" className={styles.time} name='doors' id='doors' onChange={(event) => setTime(event.target.value)} required />
      </div>
      <div className={styles.box}>
        <div className={styles.text}>Support act:</div>
        {showSupport()}
      </div>
      <div className={styles.box}>
        <div className={styles.text}>Concert:</div>
        <input type="time" className={styles.time} name='main' id='main' required />
      </div>
    </div>
  );
}
export default TimetableUpload;
