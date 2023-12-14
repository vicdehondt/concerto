import Image from "next/image";
import styles from "@/styles/FriendCard.module.css";
import { User as LucideUser } from 'lucide-react';
import Link from "next/link";
import { User } from "@/components/BackendTypes";

type FriendCardProps = {
  friend: User;
}

function FriendCard({ friend }: FriendCardProps) {

  function showPicture() {
    if (friend.image != null) {
      return <Image src={friend.image} width={170} height={170} alt="Profile picture of user." />;
    }
    return <LucideUser className={styles.userPicture} width={170} height={170} />;
  }

  return (
    <Link href={`/accounts/${friend.userID}`} className={styles.friendCardContainer}>
      {showPicture()}
      <div className={styles.name}>{friend.username}</div>
    </Link>
  );
}

export default FriendCard;
