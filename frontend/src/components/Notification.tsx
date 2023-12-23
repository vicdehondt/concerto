import styles from "@/styles/Notification.module.css";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Event, User } from "./BackendTypes";
import { environment } from "./Environment";
import { Notification } from "./BackendTypes";
import { handleFetchError } from "./ErrorHandler";
import { useRouter } from "next/router";

function Notification({
  notification,
  removeNotification,
}: {
  notification: Notification;
  removeNotification: (number: number) => void;
}) {
  const router = useRouter();
  const [from, setFrom] = useState<User | null>();
  const [event, setEvent] = useState<Event | null>(null);

  // Fetch the user that sent the notification.
  // Fetch the event that the notification is about.
  useEffect(() => {
    if (notification) {
      const notificationType = notification.NotificationObject.notificationType;

      const fetchUser = async () => {
        try {
          const response = await fetch(
            environment.backendURL + `/users/${notification.NotificationObject.actor}`,
            {
              mode: "cors",
              credentials: "include",
            }
          );

          if (response.ok) {
            const data = await response.json();
            setFrom(data);
          } else {
            setFrom(null);
          }
        } catch (error) {
          handleFetchError(error, router);
        }
      };

      const fetchEvent = async () => {
        try {
          const response = await fetch(
            environment.backendURL + `/events/${notification.NotificationObject.typeID}`,
            {
              mode: "cors",
              credentials: "include",
            }
          );

          if (response.ok) {
            const data = await response.json();
            setEvent(data);
          } else {
            setEvent(null);
          }
        } catch (error) {
          handleFetchError(error, router);
        }
      };

      if (
        notificationType == "friendrequestreceived" ||
        notificationType === "friendrequestaccepted" ||
        notificationType === "eventInviteReceived"
      ) {
        fetchUser();
      }
      if (notificationType == "reviewEvent" || notificationType === "eventInviteReceived") {
        fetchEvent();
      }
    }
  }, [notification]);

  // If the notification is about a friend request, remove the notification when the request is accepted.
  useEffect(() => {
    if (
      notification.NotificationObject.notificationType == "friendrequestaccepted" &&
      (event?.checkedIn || ended(event))
    ) {
      removeNotification(notification.notificationID);
    }
  }, [event?.checkedIn, event, notification.notificationID, removeNotification]);

  // If the notification is about an event, remove the notification when the event is checked in or has ended.
  function ended(event: Event | null) {
    if (event) {
      return new Date(event.dateAndTime) < new Date();
    }
    return false;
  }

  function acceptFriend() {
    try {
      fetch(environment.backendURL + `/friends/${notification.NotificationObject.actor}/accept`, {
        method: "POST",
        mode: "cors",
        credentials: "include",
      });
      removeNotification(notification.notificationID);
    } catch (error) {
      handleFetchError(error, router);
    }
  }

  function declineFriend() {
    try {
      fetch(environment.backendURL + `/friends/${notification.NotificationObject.actor}/deny`, {
        method: "POST",
        mode: "cors",
        credentials: "include",
      });
    } catch (error) {
      handleFetchError(error, router);
    }
  }

  if (notification.NotificationObject.notificationType == "friendrequestreceived") {
    return (
      <>
        <div key={notification.notificationID} className={styles.notificationContainer}>
          <div className={styles.message}>{from && from.username} wants to be your friend.</div>
          <div className={styles.buttonBox}>
            <button onClick={(event) => acceptFriend()}>Accept</button>
            <button onClick={(event) => declineFriend()}>Decline</button>
          </div>
        </div>
      </>
    );
  }
  if (notification.NotificationObject.notificationType == "friendrequestaccepted") {
    return (
      <>
        <div key={notification.notificationID} className={styles.notificationContainer}>
          <div className={styles.message}>
            {from && from.username} accepted your friend request!
          </div>
        </div>
      </>
    );
  }
  if (notification.NotificationObject.notificationType == "reviewEvent") {
    return (
      <>
        <div key={notification.notificationID} className={styles.notificationContainer}>
          <Link
            className={styles.message}
            href={`/ratings/add-rating?from=${encodeURIComponent("/")}&venue=${
              event?.Venue.venueID
            }&artist=${event?.Artist.artistID}&event=${event?.eventID}&notificationID=${
              notification?.notificationID
            }`}
          >
            <div className={styles.eventMessage}>Event {event?.title} ended.</div>
            <div className={styles.rateMessage}>
              Would you like to rate &quot;artistName&quot; and &quot;venueName&quot;?
            </div>
          </Link>
        </div>
      </>
    );
  }
  if (notification.NotificationObject.notificationType == "eventInviteReceived") {
    return (
      <>
        <div key={notification.notificationID} className={styles.notificationContainer}>
          <Link className={styles.message} href={`/concerts/${event?.eventID}`}>
            <div className={styles.eventMessage}>
              {" "}
              {from && from.username} invited you to {event?.title}.
            </div>
            <div className={styles.rateMessage}>Click to see the event.</div>
          </Link>
        </div>
      </>
    );
  }
  return null;
}

export default Notification;
