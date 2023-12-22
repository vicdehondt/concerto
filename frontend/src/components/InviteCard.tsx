import Image from "next/image";
import styles from "@/styles/InviteCard.module.css";
import { Friend } from "./BackendTypes";
import { User } from "lucide-react";
import { environment } from "./Environment";
import { useState } from "react";
import { handleFetchError } from "./ErrorHandler";
import { useRouter } from "next/router";

type InviteCardProps = {
  friend: Friend;
  eventID: number;
};

// This component is used to show a friend that can be invited to an event.
function InviteCard({ eventID, friend }: InviteCardProps) {
  const router = useRouter();
  const [invited, setInvited] = useState(false);

  // If a user has an image, show it. Otherwise, show a user icon.
  function showPicture() {
    if (friend.image != null) {
      return <Image src={friend.image} width={100} height={100} alt="Profile picture of friend" />;
    }
    return <User className={styles.userPicture} width={100} height={100} />;
  }

  // Invite a friend to an event by sending a POST request with a form data body that holds the userID.
  async function inviteFriend() {
    const formData = new FormData();
    formData.append("userID", String(friend.userID));
    try {
      const response = await fetch(environment.backendURL + `/events/${eventID}/invite`, {
        method: "POST",
        mode: "cors",
        credentials: "include",
        body: formData,
      });

      setInvited(response.ok);
    } catch (error) {
      handleFetchError(error, router);
    }
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
