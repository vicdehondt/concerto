import Image from "next/image";
import styles from "@/styles/UserSearchCard.module.css";
import { User as LucidUser } from 'lucide-react';
import { User } from "./BackendTypes";
import Link from "next/link";
import { environment } from "./Environment";
import { useEffect, useState } from "react";

type UserSearchCardProps = {
  user: User;
}


function UserSearchCard({ user }: UserSearchCardProps) {

  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    fetch(environment.backendURL + "/auth/status", {
      mode: "cors",
      credentials: "include",
    })
    .then((response) => {
      setLoggedIn(response.status === 200);
    });
  }, []);


	function redirectURL(normalURL: string) {
    if (loggedIn) {
      return normalURL;
    } else {
      return `/login?from=${encodeURIComponent(normalURL)}`;
    }
  }

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
