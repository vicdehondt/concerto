import { Inter } from "next/font/google";
import Image from "next/image";
import styles from "../styles/Biography.module.css";

function Biography({ source, username }: { source: string; username: string }) {
  return (
    <div className={styles.biographyContainer}>
        <div className={styles.photoAndName}>
            <Image src={source} width={170} height={170} alt="Profile picture of user." />
            <div className={styles.name}>{username}</div>
        </div>
      <div className={styles.titleAndBio}>
            <div className={styles.title}>
                Biography
            </div>
            <div className={styles.bio}>
                Here needs to come the bio
            </div>
        </div>
    </div>
  );
}

export default Biography;
