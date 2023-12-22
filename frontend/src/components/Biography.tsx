import Image from "next/image";
import { User as LucidUser } from "lucide-react";
import styles from "@/styles/Biography.module.css";
import { useEffect, useState } from "react";
import { Profile, User } from "@/components/BackendTypes";
import { environment } from "@/components/Environment";
import { handleFetchError } from "./ErrorHandler";
import { useRouter } from "next/router";

type BiographyProps = {
  user: User;
  source: string;
  username: string;
  description: string;
};

type Friendship = "none" | "pending" | "accepted";

function Biography({ user, source, username, description }: BiographyProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [friendship, setFriendship] = useState<Friendship>("none");
  const [hovering, setHovering] = useState(false);

  const [requestSent, setRequestSent] = useState(
    user.friendship == "pending" || user.friendship == "accepted"
  );

  // Set the friendship relation when initialising.
  useEffect(() => {
    if (user && typeof user.friendship === "string") {
      setFriendship(user.friendship as Friendship);
    }
  }, [user]);

  // If a user has an image, show it. Otherwise, show a user icon.
  function showPicture(source: string) {
    if (source) {
      return (
        <Image
          style={{ objectFit: "cover" }}
          src={source}
          width={170}
          height={170}
          alt="Profile picture of user."
        />
      );
    }
    return <LucidUser fill={"black"} className={styles.userPicture} width={170} height={170} />;
  }

  // Fetch the profile and hold in a useState variable upon initialising.
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(environment.backendURL + "/profile", {
          mode: "cors",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        }
      } catch (error) {
        handleFetchError(error, router);
      }
    };
    fetchProfile();
  }, []);

  // When the invite button is clicked, try to send a POST request to the backend.
  // When successful, update the friendsip relation to pending.
  function inviteFriend() {
    const formData = new FormData();
    formData.append("receiverID", String(user.userID));
    const fetchFriends = async () => {
      try {
        const response = await fetch(environment.backendURL + "/friends", {
          method: "POST",
          mode: "cors",
          credentials: "include",
          body: formData,
        });

        if (response.ok) {
          setRequestSent(true);
          setFriendship("pending");
        }
      } catch (error) {
        handleFetchError(error, router);
      }
    };
    fetchFriends();
  }

  // When the remove button is clicked, try to send a DELETE request to the backend.
  // When successful, update the friendsip relation to none.
  async function removeFriend() {
    try {
      const response = await fetch(environment.backendURL + `/friends/${user.userID}`, {
        method: "DELETE",
        mode: "cors",
        credentials: "include",
      });

      if (response.ok) {
        setFriendship("none");
      }
    } catch (error) {
      handleFetchError(error, router);
    }
  }

  // When the user has already requested a friendship, but wants to undo that, the user can by clicking the undo button.
  // We try to send a DELETE request on the friend-request to the backend.
  // When successful, update the friendsip relation to none.
  async function undoRequest() {
    try {
      const response = await fetch(environment.backendURL + `/friends/${user.userID}/request`, {
        method: "DELETE",
        mode: "cors",
        credentials: "include",
      });

      if (response.ok) {
        setRequestSent(false);
        setFriendship("none");
      }
    } catch (error) {
      handleFetchError(error, router);
    }
  }

  // Show other buttons based on the hovering.
  function handleMouseEnter() {
    setHovering(true);
  }

  // Show other buttons based on the hovering.
  function handleMouseLeave() {
    setHovering(false);
  }

  function showFriendButton() {
    if (friendship == "none") {
      return (
        <div className={styles.buttonContainer}>
          <button className={styles.friendButton} onClick={(event) => inviteFriend()}>
            Add friend
          </button>
        </div>
      );
    } else if (friendship == "pending") {
      return (
        <>
          <div className={styles.buttonContainer}>
            <button
              className={styles.friendButton}
              onClick={(event) => undoRequest()}
              onMouseEnter={(event) => handleMouseEnter()}
              onMouseLeave={(event) => handleMouseLeave()}
            >
              {hovering ? "Undo request" : "Request sent!"}
            </button>
          </div>
        </>
      );
    } else {
      return (
        <>
          <div className={styles.friendMessage}>Friends</div>
          <div className={styles.buttonContainer}>
            <button className={styles.friendButton} onClick={(event) => removeFriend()}>
              Unfriend
            </button>
          </div>
        </>
      );
    }
  }

  return (
    <>
      <div className={styles.biographyContainer}>
        <div className={styles.pictureAndName}>
          <div className={styles.profilePicture}>{showPicture(source)}</div>
          <div className={styles.username}>{username}</div>
          {profile && profile.userID != user.userID && showFriendButton()}
        </div>
        <div className={styles.title}>Biography</div>
        <div className={styles.description}>{description}</div>
      </div>
    </>
  );
}

export default Biography;
