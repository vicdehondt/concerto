import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/Navbar.module.css";
import Link from "next/link";
import Searchbar from "./Searchbar";
import Notification from "./Notification";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { X } from 'lucide-react';


const environment = {
  backendURL: "http://localhost:8080",
};
if (process.env.NODE_ENV == "production") {
  environment.backendURL = "https://api.concerto.dehondt.dev";
}


function Navbar({pictureSource}: {pictureSource: string}) {

  const router = useRouter();

  const [notificationsVisible, setNotificationsVisible] = useState(false);

  const [notifications, setNotifications] = useState([]);

  const [loggedIn, setLoggedIn] = useState(false);

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

    fetch(environment.backendURL + "/auth/status", {
      mode: "cors",
      credentials: "include",
    })
      .then((response) => {
        if (response.status == 200) {
          setLoggedIn(true)
        } else if (response.status == 400) {
          setLoggedIn(false)
        }
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
    if (loggedIn) {
      setNotificationsVisible(val => !val)
      const notificationBox = document.getElementsByClassName(styles.notificationsBox) as HTMLCollectionOf<HTMLElement>;
      if (notificationsVisible) {
        notificationBox[0].style.display = "none";
      } else {
        notificationBox[0].style.display = "block";
      }
    } else {
      router.push(`/login?from=${router.asPath}`);
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

  function redirectURL(normalURL: string) {
    if (loggedIn) {
      return normalURL;
    }
    return `/login?from=${encodeURIComponent(normalURL)}`
  }

  return (
    <>
    <nav className={styles.navbar}>
      <div className={styles.leftTopics}>
        <Link href="/">Concerto</Link>
        <Searchbar type="long" />
        <div className={styles.addEventButton}>
          <Link href={redirectURL("/add-event")}>+</Link>
        </div>
      </div>
      <div className={styles.rightTopics}>
        <Link href={redirectURL("/friends")}>Friends</Link>
        <Link href={redirectURL("/wishlist")}>Wishlist</Link>
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
          <Link href={redirectURL("/account")}>
            <Image src={pictureSource} width={56} height={56} alt="Profile picture"/>
          </Link>
        </div>
      </div>
    </nav>
    </>
  );
}

export default Navbar;
