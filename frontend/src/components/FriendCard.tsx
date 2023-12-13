import Image from "next/image";
import styles from "@/styles/FriendCard.module.css";
import { User } from 'lucide-react';

function FriendCard({ source, username }: { source: string; username: string }) {

  function showPicture() {
    if (source != null) {
      return <Image src={source} width={170} height={170} alt="Profile picture of user." />;
    }
    return <User className={styles.userPicture} width={170} height={170} />;
  }

  return (
    <div className={styles.friendCardContainer}>
      {showPicture()}
      <div className={styles.name}>{username}</div>
    </div>
  );
}

export default FriendCard;
