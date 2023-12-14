import Image from "next/image";
import styles from "@/styles/InviteCard.module.css";
import { Friend } from "./BackendTypes";
import { User } from "lucide-react";
import { environment } from "./Environment";
import { useState } from "react";

type InviteCardProps = {
  friend: Friend;
  eventID: number;
};

function InviteCard({ eventID, friend }: InviteCardProps) {
  const [invited, setInvited] = useState(false);

  function showPicture() {
    if (friend.image != null) {
      return <Image src={friend.image} width={100} height={100} alt="Profile picture of friend" />;
    }
    return <User className={styles.userPicture} width={100} height={100} />;
  }

  function inviteFriend() {
    const formData = new FormData();
    formData.append("userID", String(friend.userID));
    fetch(environment.backendURL + `/events/${eventID}/invite`, {
      method: "POST",
      mode: "cors",
      credentials: "include",
      body: formData,
    }).then((response) => {
      if (response.status == 200) {
        setInvited(true);
      }
    });
  }

  return (
    <div className={styles.inviteCardContainer}>
      <div className={styles.pictureContainer}>{showPicture()}</div>
      <div className={styles.profileNameContainer}>{friend.username}</div>
      <div className={styles.inviteButtonContainer}>
				{invited ? <div className={styles.invited}>Invited!</div> : (
					<button className={styles.inviteButton} onClick={(event) => inviteFriend()}>
						Invite
					</button>
				)}
      </div>
    </div>
  );
}

export default InviteCard;
