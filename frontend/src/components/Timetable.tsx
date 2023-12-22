import styles from "@/styles/Timetable.module.css";

function Timetable({
  doorTime,
  supportTime,
  concertTime,
}: {
  doorTime: string | null;
  supportTime: string | null;
  concertTime: string | null;
}) {

  // Show the support act time if it exists.
  function showSupportTime() {
    if (supportTime != null) {
      return (
        <div className={styles.box}>
          <div className={styles.text}>Support act:</div>
          <div className={styles.time}>{supportTime}</div>
        </div>
      )
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.box}>
        <div className={styles.text}>Doors open:</div>
        <div className={styles.time}>{doorTime}</div>
      </div>
      {showSupportTime()}
      <div className={styles.box}>
        <div className={styles.text}>Concert:</div>
        <div className={styles.time}>{concertTime}</div>
      </div>
    </div>
  );
}
export default Timetable;
