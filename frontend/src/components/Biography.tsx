import { Inter } from "next/font/google";
import Image from "next/image";
import { User } from 'lucide-react';
import styles from "../styles/Biography.module.css";

function Biography({ source, username }: { source: string; username: string }) {

  function showPicture(source: string) {
    if (source != null) {
      return <Image src={source} width={170} height={170} alt="Profile picture of user." />;
    }
    return <User fill={'black'} className={styles.userPicture} width={170} height={170} />;
  }

  return (
    <>
      <div className={styles.biographyContainer}>
        <div className={styles.pictureAndName}>
          <div className={styles.profilePicture}>
            {showPicture(source)}
          </div>
          <div className={styles.username}>
            {username}
          </div>
        </div>
        <div className={styles.title}>
          Biography
        </div>
        <div className={styles.description}>
          Lorem ipsum of the description.
        </div>
      </div>
    </>
  );
}

export default Biography;
