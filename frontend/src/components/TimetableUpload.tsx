import { useState } from "react";
import styles from "../styles/TimetableUpload.module.css";

type TimetableUploadProps = {
  time?: string;
  mainTime?: string;
  supportTime?: string;
  setTime: (string: string) => void;
};

function TimetableUpload({ mainTime, supportTime, time, setTime }: TimetableUploadProps) {
  const [support, setSupport] = useState(false);

  function showSupport() {
    if (supportTime) {
      return <input type="time" className={styles.time} name="support" id="support" defaultValue={supportTime} required />;
    }
    if (support) {
      return <input type="time" className={styles.time} name="support" id="support" required />;
    }
    return (
      <button className={styles.addSupport} onClick={(e) => setSupport(true)}>
        Add time
      </button>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.box}>
        <div className={styles.text}>Doors open:</div>
        {time ? (
          <input
            type="time"
            className={styles.time}
            name="doors"
            id="doors"
            defaultValue={time}
            onChange={(event) => setTime(event.target.value)}
            required
          />
        ) : (
          <input
            type="time"
            className={styles.time}
            name="doors"
            id="doors"
            onChange={(event) => setTime(event.target.value)}
            required
          />
        )}
      </div>
      <div className={styles.box}>
        <div className={styles.text}>Support act:</div>
        {showSupport()}
      </div>
      <div className={styles.box}>
        <div className={styles.text}>Concert:</div>
        {time ? (
          <input
            type="time"
            defaultValue={mainTime}
            className={styles.time}
            name="main"
            id="main"
            required
          />
        ) : (
          <input
            type="time"
            className={styles.time}
            name="main"
            id="main"
            required />
        )}
      </div>
    </div>
  );
}
export default TimetableUpload;
