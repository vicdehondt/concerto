import styles from "../styles/Timetable.module.css";

function Timetable({descriptions, hours}: {descriptions: string[], hours: string[]}) {
    return (
        <div className={styles.container}>
            <TimeElement description="Opening of door:" hour="10:00" />
        </div>
    )
}

function TimeElement({description, hour}: {description: string, hour: string}) {
    return (
        <div className={styles.timetableElement}>
            <div className={styles.description}>
                {description}
            </div>
            <div className={styles.hour}>
                {hour}
            </div>
        </div>
    )
}

export default Timetable