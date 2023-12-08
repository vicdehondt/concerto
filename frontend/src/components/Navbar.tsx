import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/Navbar.module.css";
import Link from "next/link";
import Searchbar from "./Searchbar";
import Notification from "./Notification";
import { useState, useEffect, useRef, ReactNode } from "react";
import { useRouter } from "next/router";
import { X, User } from "lucide-react";

type Profile = {
  image: string;
  username: string;
  userID: number;
  mail: string;
  privacyAttendedEvents: string;
  privacyCheckedInEvents: string;
  privacyFriends: string;
};

const environment = {
  backendURL: "http://localhost:8080",
};
if (process.env.NODE_ENV == "production") {
  environment.backendURL = "https://api.concerto.dehondt.dev";
}

function Navbar({ pictureSource }: { pictureSource: string }) {
  const router = useRouter();

  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsHTML, setNotificationsHTML] = useState<ReactNode[]>([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [profile, setProfile] = useState({ userID: 0, image: null });

  const notificationButtonRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const eventSource = new EventSource(environment.backendURL + "/notifications/subscribe", {
      withCredentials: true,
    });

    eventSource.onopen = (event) => {
      console.log("The connection has been established.", event);
    };

    eventSource.onerror = (err) => {
      console.error("EventSource failed:", err);
    };

    eventSource.addEventListener("notification", async (event) => {
      const eventData = JSON.parse(event.data);
      if (eventData.NotificationObject.notificationType !== "friendrequestaccepted") {
        const updatedNotifications = [...notifications, eventData];
        setNotifications(updatedNotifications);
        setNotificationsHTML(convertNotifications(updatedNotifications));
      }
    });

    setNotificationsHTML(convertNotifications(notifications));

    return () => {
      eventSource.close();
    };
  }, [notifications]);

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
        setNotifications(responseJSON);
      });

    fetch(environment.backendURL + "/auth/status", {
      mode: "cors",
      credentials: "include",
    }).then((response) => {
      if (response.status == 200) {
        setLoggedIn(true);
      } else if (response.status == 400) {
        setLoggedIn(false);
      }
    });

    fetch(environment.backendURL + "/profile", {
      mode: "cors",
      credentials: "include",
    })
      .then((response) => {
        if (response.status == 200) {
          return response.json();
        } else {
          return { userID: 0, image: null };
        }
      })
      .then((responseJSON) => {
        setProfile(responseJSON);
      });
  }, []);

  useEffect(() => {
    const handleOutSideClick = (event: Event) => {
      if (
        event.target != null &&
        !notificationButtonRef.current?.contains(event.target as Node) &&
        !notificationsRef.current?.contains(event.target as Node)
      ) {
        closeNotifications();
      }
    };
    window.addEventListener("mousedown", handleOutSideClick);
    return () => {
      window.removeEventListener("mousedown", handleOutSideClick);
    };
  }, [notificationButtonRef, notificationsRef]);

  function toggleNotifications() {
    if (loggedIn) {
      setNotificationsVisible((val) => !val);
      const notificationBox = document.getElementsByClassName(
        styles.notificationsBox
      ) as HTMLCollectionOf<HTMLElement>;
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
    const notificationBox = document.getElementsByClassName(
      styles.notificationsBox
    ) as HTMLCollectionOf<HTMLElement>;
    setNotificationsVisible(false);
    notificationBox[0].style.display = "none";
  }

  const removeNotification = (notificationID: number) => {
    fetch(environment.backendURL + `/notifications/${notificationID}`, {
      method: "POST",
      mode: "cors",
      credentials: "include",
    })
      .then((response) => {
        if (response.status === 200) {
          setNotifications((prevNotifications) =>
            prevNotifications.filter(
              (notification: Notification) => notification.notificationID !== notificationID
            )
          );
          setNotificationsHTML((prevNotificationsHTML) =>
            prevNotificationsHTML.filter((notification: ReactNode) => {
              const notificationWithKey = notification as { key?: number };
              return notificationWithKey && notificationWithKey.key !== notificationID;
            })
          );
        } else {
          console.error("Error removing notification. Server response:", response);
        }
      })
      .catch((error) => console.error("Error removing notification:", error));
  };

  function convertNotifications(notifications: Array<Notification>): JSX.Element[] {
    if (notifications.length === 0) {
      return [<div key={0}>No notifications found.</div>];
    }

    return notifications.map((notification, index) => (
      <div key={notification.notificationID}>
        <Notification notification={notification} removeNotification={removeNotification} />
      </div>
    ));
  }

  function redirectURL(normalURL: string) {
    if (loggedIn) {
      return normalURL;
    }
    return `/login?from=${encodeURIComponent(normalURL)}`;
  }

  function logOut() {
    fetch(environment.backendURL + "/logout", {
      method: "POST",
      mode: "cors",
      credentials: "include",
    }).then((response) => {
      if (response.status == 200) {
        router.reload();
      }
    });
  }

  function showAccountImage() {
    if (profile.userID == 0) {
      return (
        <button className={styles.loginButton} onClick={(event) => router.push(redirectURL("/"))}>
          Log In
        </button>
      );
    } else if (profile.image == null) {
      return (
        <Link href={redirectURL("/account")}>
          <User className={styles.userImage} width={40} height={40} />
        </Link>
      );
    } else {
      return (
        <Link href={redirectURL("/account")}>
          <Image src={pictureSource} width={56} height={56} alt="Profile picture" />
        </Link>
      );
    }
  }

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.leftTopics}>
          <Link href="/">Concerto</Link>
          <Searchbar type="long" onChange={(event) => console.log("Not impmeneted yet")} />
          <div className={styles.addEventButton}>
            <Link href={redirectURL("/add-event")}>+</Link>
          </div>
        </div>
        <div className={styles.rightTopics}>
          <Link href={redirectURL("/friends")}>Friends</Link>
          <Link href={redirectURL("/wishlist")}>Wishlist</Link>
          <div className={styles.notifications} ref={notificationButtonRef}>
            <button
              id="notifications"
              className={styles.notificationButton}
              onClick={() => toggleNotifications()}
            >
              Notifications
            </button>
          </div>
          <div className={styles.notificationsBox} ref={notificationsRef}>
            <button
              id="closeNotifications"
              className={styles.closeNotifications}
              onClick={() => closeNotifications()}
            >
              <X />
            </button>
            {notificationsVisible && notificationsHTML}
          </div>
          <div className={styles.accountDropdown}>
            <div
              className={styles.profilePicture}
              onMouseEnter={() => setDropdownVisible(true)}
              onMouseLeave={() => setDropdownVisible(false)}
            >
              {showAccountImage()}
            </div>
            {loggedIn && dropdownVisible && (
              <div
                className={styles.dropdownContent}
                onMouseEnter={() => {
                  setDropdownVisible(true);
                }}
                onMouseLeave={() => {
                  setDropdownVisible(false);
                }}
              >
                <Link href="/settings">Settings</Link>
                <button onClick={(event) => logOut()}>Log out</button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;
