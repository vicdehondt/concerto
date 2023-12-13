import styles from "@/styles/Notification.module.css";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Event } from "./BackendTypes";
import { environment } from "./Environment";
import { Notification } from "./BackendTypes";

function Notification({ notification, removeNotification }: {notification: Notification, removeNotification: (number: number) => void}) {

  const [from, setFrom] = useState({username: "Loading..."});
  const [event, setEvent] = useState<Event | null>(null);

  useEffect(() => {

    if (notification) {
      const notificationType = notification.NotificationObject.notificationType;

      if (notificationType == "friendrequestreceived") {
        fetch(environment.backendURL + `/users/${notification.NotificationObject.actor}`, {
          mode: "cors",
          credentials: "include",
        })
          .then((response) => {
            if (response.status == 200) {
              return response.json();
            }
            return null
          })
          .then((responseJSON) => {
            setFrom(responseJSON);
          });
      }
      if (notificationType == "reviewEvent") {
        fetch(environment.backendURL + `/events/${notification.NotificationObject.typeID}`, {
          mode: "cors",
          credentials: "include",
        })
          .then((response) => {
            if (response.status == 200) {
              return response.json();
            }
            return null
          })
          .then((responseJSON) => {
            setEvent(responseJSON);
          });
      }
    }
  }, [notification]);

  function acceptFriend() {
    fetch(environment.backendURL + `/friends/${notification.NotificationObject.actor}/accept`, {
      method: 'POST',
      mode: "cors",
      credentials: "include",
    });
    removeNotification(notification.notificationID)
  }

  function declineFriend() {
    fetch(environment.backendURL + `/friends/${notification.NotificationObject.actor}/deny`, {
      method: 'POST',
      mode: "cors",
      credentials: "include",
    });
  }

  if (notification.NotificationObject.notificationType == "friendrequestreceived") {
    return (
      <>
        <div key={notification.notificationID} className={styles.notificationContainer}>
          <div className={styles.message}>{from.username} wants to be your friend.</div>
          <div className={styles.buttonBox}>
            <button onClick={(event) => acceptFriend()}>Accept</button>
            <button onClick={(event) => declineFriend()}>Decline</button>
          </div>
        </div>
      </>
    )
  }
  if (notification.NotificationObject.notificationType == "reviewEvent") {
    return (
      <>
        <div key={notification.notificationID} className={styles.notificationContainer}>
          {/* http://localhost:3000/ratings/add-rating?from=${fromURL}&venue=${venueID}&artist=${artistID}&event=${eventID} */}
          <Link className={styles.message} href={`/ratings/add-rating?from=${encodeURIComponent("/")}&venue=${event?.venueID}&artist=${event?.artistID}&event=${event?.eventID}&notificationID=${notification?.notificationID}`}>
            <div className={styles.eventMessage}>Event {event?.title} ended.</div>
            <div className={styles.rateMessage}>Would you like to rate &quot;artistName&quot; and &quot;venueName&quot;?</div>
            {/* Would you like to rate {event?.artistName} and {event?.venueName} it? */}
          </Link>
        </div>
      </>
    )
  }
  return null;
}

export default Notification;
