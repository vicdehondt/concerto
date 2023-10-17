import { Inter } from "next/font/google";
import Image from "next/image";
import styles from "../styles/FriendCard.module.css";

function FriendCard({ source, username }: { source: string; username: string }) {
  return (
    <div className={styles.friendCardContainer}>
      <Image src={source} width={170} height={170} alt="Profile picture of user." />
      <div className={styles.name}>{username}</div>
    </div>
  );
}

export default FriendCard;
