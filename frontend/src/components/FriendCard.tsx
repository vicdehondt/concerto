import Image from "next/image";
import styles from "@/styles/FriendCard.module.css";
import { User as LucideUser } from "lucide-react";
import Link from "next/link";
import { Friend } from "@/components/BackendTypes";

type FriendCardProps = {
  friend: Friend;
};

// Shows a card of a friend to be placed in a list of friends.
function FriendCard({ friend }: FriendCardProps) {
  // If a user has an image, show it. Otherwise, show a user icon.
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
