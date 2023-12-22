import styles from "@/styles/FriendInvite.module.css";
import InviteCard from "@/components/InviteCard";
import { useEffect } from "react";
import { environment } from "./Environment";
import { useState } from "react";
import { Friend } from "./BackendTypes";
import { handleFetchError } from "./ErrorHandler";
import { useRouter } from "next/router";

type FriendInvitesProps = {
  eventID: number | undefined;
};

// This component is used to show a list of friends that can be invited to an event.
function FriendInvites({ eventID }: FriendInvitesProps) {
  const router = useRouter();
  const [friends, setFriends] = useState<Friend[]>([]);

  function showFriends(friends: Array<Friend>) {
    return friends.map((friend) => {
      if (friend && eventID) {
        return <InviteCard key={friend.userID} eventID={eventID} friend={friend} />;
      }
      return null;
    });
  }

  // Fetch the friends that can be invited to an event.
  // This is done by fetching the friends of the user that are not already invited to the event.
  // Save them in a useState variable.
  useEffect(() => {
    if (eventID) {
      const fetchEvents = async () => {
        try {
          const response = await fetch(
            environment.backendURL + "/events" + `/${eventID}` + "/invitable",
            {
              mode: "cors",
              credentials: "include",
            }
          );

          if (response.ok) {
            const data = await response.json();
            setFriends(data);
          } else {
            setFriends([]);
          }
        } catch (error) {
          handleFetchError(error, router);
        }
      };
      fetchEvents();
    }
  }, [eventID]);

  return <div className={styles.inviteContainer}>{friends && showFriends(friends)}</div>;
}

export default FriendInvites;
