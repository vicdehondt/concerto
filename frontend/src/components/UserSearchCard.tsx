import Image from "next/image";
import styles from "@/styles/UserSearchCard.module.css";
import { User as LucidUser } from 'lucide-react';
import { User } from "./BackendTypes";
import Link from "next/link";

type UserSearchCardProps = {
  user: User;
  loggedIn: boolean;
}

function UserSearchCard({ user, loggedIn }: UserSearchCardProps) {

  // If a user is logged in, redirect to the normal URL.
  // If a user is not logged in, redirect to the login page.
	function redirectURL(normalURL: string) {
    if (loggedIn) {
      return normalURL;
    } else {
      return `/login?from=${encodeURIComponent(normalURL)}`;
    }
  }

  // If a user has an image, show it. Otherwise, show a user icon.
  function showPicture() {
    if (user.image != null) {
      return <Image style={{ objectFit: "cover" }} src={user.image} width={50} height={50} alt="Profile picture of the user." />;
    }
    return <LucidUser className={styles.userPicture} width={30} height={30} />;
  }

  return (
    <div className={styles.cardContainer}>
      {user &&
      <Link key={user.userID} href={redirectURL(`/accounts/${user.userID}`)}>
        {showPicture()}
        <div className={styles.name}>{user.username}</div>
      </Link>}
    </div>
  );
}

export default UserSearchCard;
