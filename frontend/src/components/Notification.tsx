import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/Notification.module.css";
import Link from "next/link";
import { useEffect, useState } from "react";

const environment = {
  backendURL: "http://localhost:8080",
};
if (process.env.NODE_ENV == "production") {
  environment.backendURL = "https://api.concerto.dehondt.dev";
}

type Notification = {
  notificationID: number;
  status: string;
  NotificationObject: {
    notificationType: string,
    actor: number,
  }
};

type User = {
  userID: number;
  username: string;
  image: string;
  createdAt: string;
  updatedAt: string;
};

function Notification({ notification, removeNotification }: {notification: Notification, removeNotification: (number: number) => void}) {

  const [from, setFrom] = useState({username: "Loading..."});

  useEffect(() => {
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
        setFrom(responseJSON)
      });
  }, [notification.NotificationObject.actor]);

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

  // return notification.NotificationObject.notificationType == "friendrequestreceived" ? (
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

export default Notification;
