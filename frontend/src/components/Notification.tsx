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

// Notification response
// [
//   {
//     "notificationID": 1,
//     "status": "unseen",
//     "NotificationObject": {
//       "notificationType": "friendrequestreceived",
//       "actor": 2
//     }
//   }
// ]


// User respons
// {
//   "userID": 1,
//   "username": "Test",
//   "image": null,
//   "createdAt": "2023-11-23T10:37:01.810Z",
//   "updatedAt": "2023-11-23T10:37:01.810Z"
// }

// function Notification({notification}: {notification: Notification}) {
function Notification({ key, notificationObject }: {key: number, notificationObject: Notification}) {

  const placeholder = "Reinout Cloosen"

  // const [from, setFrom] = useState(null);

  // useEffect(() => {
  //   fetch(environment.backendURL + "/users", {
  //     mode: "cors",
  //     credentials: "include",
  //   })
  //     .then((response) => {
  //       if (response.status == 200) {
  //         return response.json();
  //       }
  //       return null
  //     })
  //     .then((responseJSON) => {
  //       console.log(responseJSON)
  //       setFrom(responseJSON)
  //     });
  // }, []);

  // return notification.NotificationObject.notificationType == "friendrequestreceived" ? (
  return (
    <>
      <div key={key} className={styles.notificationContainer}>
        <div className={styles.message}>{placeholder} wants to be your friend.</div>
        <form className={styles.buttonBox}>
          <button>Accept</button>
          <button>Decline</button>
        </form>
      </div>
    </>
  )
}

export default Notification;
