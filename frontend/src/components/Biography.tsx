import Image from "next/image";
import { User } from 'lucide-react';
import styles from "@/styles/Biography.module.css";

function Biography({ source, username, description }: { source: string; username: string, description: string }) {

  function showPicture(source: string) {
    if (source) {
      return <Image style={{ objectFit: "cover" }} src={source} width={170} height={170} alt="Profile picture of user." />;
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
          {description}
        </div>
      </div>
    </>
  );
}

export default Biography;
