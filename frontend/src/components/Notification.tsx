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
      if (notificationType === "friendrequestaccepted") {
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
      if (notificationType === "eventInviteReceived") {
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

  useEffect(() => {
    if (event?.checkedIn || ended(event)) {
      removeNotification(notification.notificationID)
    }
  }, [event?.checkedIn, event, notification.notificationID, removeNotification]);

  function ended(event: Event | null) {
    if (event) {
      return (new Date(event.dateAndTime) < new Date());
    }
    return false;
  }

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
  if (notification.NotificationObject.notificationType == "friendrequestaccepted") {
    return (
      <>
        <div key={notification.notificationID} className={styles.notificationContainer}>
          <div className={styles.message}>{from.username} accepted your friend request!</div>
        </div>
      </>
    )
  }
  if (notification.NotificationObject.notificationType == "reviewEvent") {
    return (
      <>
        <div key={notification.notificationID} className={styles.notificationContainer}>
          <Link className={styles.message} href={`/ratings/add-rating?from=${encodeURIComponent("/")}&venue=${event?.Venue.venueID}&artist=${event?.Artist.artistID}&event=${event?.eventID}&notificationID=${notification?.notificationID}`}>
            <div className={styles.eventMessage}>Event {event?.title} ended.</div>
            <div className={styles.rateMessage}>Would you like to rate &quot;artistName&quot; and &quot;venueName&quot;?</div>
          </Link>
        </div>
      </>
    )
  }
  if (notification.NotificationObject.notificationType == "eventInviteReceived") {
    return (
      <>
        <div key={notification.notificationID} className={styles.notificationContainer}>
          <Link className={styles.message} href={`/concerts/${event?.eventID}`}>
            <div className={styles.eventMessage}> {from.username} invited you to {event?.title}.</div>
            <div className={styles.rateMessage}>Click to see the event.</div>
          </Link>
        </div>
      </>
    )
  }
  return null;
}

export default Notification;
