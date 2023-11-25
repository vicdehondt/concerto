import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/Navbar.module.css";
import Link from "next/link";
import Searchbar from "./Searchbar";
import Notification from "./Notification";
import { useState, useEffect, useRef } from "react";
import { X } from 'lucide-react';


const environment = {
  backendURL: "http://localhost:8080",
};
if (process.env.NODE_ENV == "production") {
  environment.backendURL = "https://api.concerto.dehondt.dev";
}


function Navbar({pictureSource}: {pictureSource: string}) {
  const [notificationsVisible, setNotificationsVisible] = useState(false);

  const [notifications, setNotifications] = useState([]);

  const notificationButtonRef = useRef(null);
  const notificationsRef = useRef(null);

  useEffect(() => {
    fetch(environment.backendURL + "/notifications", {
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
        setNotifications(responseJSON)
      });
  }, []);

  useEffect(() => {
    const handleOutSideClick = (event) => {
      if (!notificationButtonRef.current?.contains(event.target) && !notificationsRef.current?.contains(event.target)) {
        closeNotifications()
      }
    };
    window.addEventListener("mousedown", handleOutSideClick);
    return () => {
      window.removeEventListener("mousedown", handleOutSideClick);
    };
  }, [notificationButtonRef, notificationsRef]);

  function toggleNotifications() {
    setNotificationsVisible(val => !val)
    const notificationBox = document.getElementsByClassName(styles.notificationsBox) as HTMLCollectionOf<HTMLElement>;
    if (notificationsVisible) {
      notificationBox[0].style.display = "none";
    } else {
      notificationBox[0].style.display = "block";
    }
  }

  function closeNotifications() {
    const notificationBox = document.getElementsByClassName(styles.notificationsBox) as HTMLCollectionOf<HTMLElement>;
    setNotificationsVisible(false)
    notificationBox[0].style.display = "none";
  }

  function getNotifications(notifications: Array<Notification>) {
    if (notifications.length == 0) {
      return <div>No notifications found.</div>
    }
    var key = 0;
    return notifications.map((notification) => {
      key += 1;
      return <Notification key={key} notificationObject={notification} />;
    })
  }

  return (
    <>
    <nav className={styles.navbar}>
      <div className={styles.leftTopics}>
        <Link href="/">Concerto</Link>
        <Searchbar type="long" />
        <div className={styles.addEventButton}>
          <Link href="/add-event">+</Link>
        </div>
      </div>
      <div className={styles.rightTopics}>
        <Link href="/friends">Friends</Link>
        <Link href="/wishlist">Wishlist</Link>
        <div className={styles.notifications} ref={notificationButtonRef}>
          <button id="notifications" className={styles.notificationButton} onClick={() => toggleNotifications()}>Notifications</button>
        </div>
        <div className={styles.notificationsBox} ref={notificationsRef}>
          <button id="closeNotifications" className={styles.closeNotifications} onClick={() => closeNotifications()}>
            <X />
          </button>
          {notificationsVisible && getNotifications(notifications)}
        </div>
        <div className={styles.profilePicture}>
          <Link href="/account">
            <Image src={pictureSource} width={56} height={56} alt="Profile picture"/>
          </Link>
        </div>
      </div>
    </nav>
    </>
  );
}

export default Navbar;
