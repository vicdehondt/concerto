import Image from "next/image";
import { User as LucidUser } from 'lucide-react';
import styles from "@/styles/Biography.module.css";
import { useEffect, useState } from "react";
import { Profile, User } from "@/components/BackendTypes";
import { environment } from "@/components/Environment";


type BiographyProps = {
  user: User;
  source: string;
  username: string;
  description: string;
};

function Biography({ user, source, username, description }: BiographyProps) {

  const [profile, setProfile] = useState<Profile | null>(null);

  const [requestSent, setRequestSent] = useState(user.friendship == "pending" || user.friendship == "accepted");

  function showPicture(source: string) {
    if (source) {
      return <Image style={{ objectFit: "cover" }} src={source} width={170} height={170} alt="Profile picture of user." />;
    }
    return <LucidUser fill={'black'} className={styles.userPicture} width={170} height={170} />;
  }

  useEffect(() => {
    fetch(environment.backendURL + "/profile", {
      mode: "cors",
      credentials: "include",
    })
      .then((response) => {
        return response.json();
      })
      .then((responseJSON) => {
        setProfile(responseJSON);
      });
  }, []);

  function inviteFriend() {
    const formData = new FormData();
    formData.append("receiverID", String(user.userID));
    fetch(environment.backendURL + "/friends", {
      method: "POST",
      mode: "cors",
      credentials: "include",
      body: formData,
    }).then((response) => {
      if (response.status == 200) {
        setRequestSent(true);
      }
    });
  }

  function removeFriend() {
    fetch(environment.backendURL + `/friends/${user.userID}`, {
      method: "DELETE",
      mode: "cors",
      credentials: "include",
    });
  }

  function showFriendButton() {
    if (user.friendship == "none") {
      return (
        <div className={styles.friendButton}>
          <button className={styles.editButton} onClick={(event) => inviteFriend()}>Add friend</button>
        </div>
      );
    } else if (user.friendship == "pending" || requestSent) {
      return (
        <div className={styles.friendMessage}>
          Request sent!
        </div>
      );
    } else {
      return (
        <>
          <div className={styles.friendMessage}>
            Friends
          </div>
          <div className={styles.friendButton}>
            <button className={styles.editButton} onClick={(event) => removeFriend()}>Unfriend</button>
          </div>
        </>
      );
    }
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
          {profile && profile.userID != user.userID && showFriendButton()}
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
