import styles from "@/styles/FriendInvite.module.css";
import InviteCard from "@/components/InviteCard";
import { useEffect } from "react";
import { environment } from "./Environment";
import { useState } from "react";
import { Friend } from "./BackendTypes";

type FriendInvitesProps = {
	eventID: number | undefined;
}

function FriendInvites({ eventID }: FriendInvitesProps) {

	const [friends, setFriends] = useState<Friend[]>([]);

	function showFriends(friends: Array<Friend>) {
		return friends.map((friend) => {
			if (friend && eventID) {
				return <InviteCard key={friend.userID} eventID={eventID} friend={friend} />
			}
			return null;
		})
	}

  useEffect(() => {
    if (eventID) {
      fetch(environment.backendURL + "/events" + `/${eventID}` + "/invitable", {
        mode: "cors",
        credentials: "include",
      })
        .then((response) => {
          if (response.status == 200) {
            return response.json();
          }
          return [];
        })
        .then((responseJSON) => {
          setFriends(responseJSON);
        });
    }
  }, [eventID]);

  return (
    <div className={styles.inviteContainer}>
			{friends && showFriends(friends)}
    </div>
  );
}

export default FriendInvites;
