import styles from "../styles/BiographySettings.module.css";

export function BiographySettings({username, description }: { username: string, description: string }) {

  return (
    <>
      <div className={styles.generalContainer}>
        <div className={styles.username}>
            {username}
        </div>
        <div className={styles.description}>
            {description}
        </div>
      </div>
    </>
  );
}

export default BiographySettings;
