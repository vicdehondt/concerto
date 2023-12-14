import Image from "next/image";
import styles from "@/styles/UserSearchCard.module.css";
import { User as LucidUser } from 'lucide-react';
import { User } from "./BackendTypes";
import Link from "next/link";

type UserSearchCardProps = {
  user: User;
}


function UserSearchCard({ user }: UserSearchCardProps) {

  function showPicture() {
    if (user.image != null) {
      return <Image src={user.image} width={30} height={30} alt="Profile picture of the user." />;
    }
    return <LucidUser className={styles.userPicture} width={30} height={30} />;
  }

  return (
    <div className={styles.cardContainer}>
      <Link href={`/accounts/${user.userID}`}>
        {showPicture()}
        <div className={styles.name}>{user.username}</div>
      </Link>
    </div>
  );
}

export default UserSearchCard;
