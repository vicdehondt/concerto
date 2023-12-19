import styles from "@/styles/Hamburger.module.css";
import Image from "next/image";
import Searchbar from "./Searchbar";
import Link from "next/link";
import Notification from "./Notification";
import { useState, useEffect, useRef, ReactNode, useCallback } from "react";
import { useRouter } from "next/router";
import { X, User } from 'lucide-react';

type Profile = {
    image: string;
    username: string;
    userID: number;
    mail: string;
    privacyAttendedEvents: string;
    privacyCheckedInEvents: string;
    privacyFriends: string;
  }

  const environment = {
    backendURL: "http://localhost:8080",
  };
  if (process.env.NODE_ENV == "production") {
    environment.backendURL = "https://api.concerto.dehondt.dev";
  }

const HamburgerMenu = ({pictureSource}: {pictureSource: string}) => {

    const router = useRouter();

    const [isOpen, setIsOpen] = useState(false);
    const [notificationsVisible, setNotificationsVisible] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [notificationsHTML, setNotificationsHTML] = useState<ReactNode[]>([]);
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [profileDropdownVisible, setProfileDropdownVisible] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);
    const [profile, setProfile] = useState({ userID: 0, image: null });

    const notificationButtonRef = useRef<HTMLDivElement>(null);
    const notificationsRef = useRef<HTMLDivElement>(null);
  
    const convertNotifications = useCallback((notifications: Array<Notification>) => {
      if (notifications.length === 0) {
        return [<div key={0}>No notifications found.</div>];
      }
  
      return notifications.map((notification, index) => (
        <div key={notification.notificationID}>
          <Notification notification={notification} removeNotification={removeNotification} />
        </div>
      ));
    }, []);
  
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
    }, [notifications, convertNotifications]);
  
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
      if (notificationBox && notificationBox.length > 0){
      notificationBox[0].style.display = "none";
      }
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
          router.push("/");
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
            <User className={styles.userImage} width={40} height={40} />
        );
      } else {
        return (
            <Image src={pictureSource} width={56} height={56} alt="Profile picture" />
        );
      }
    }

    const toggleHamburgerMenu = () => {
        setIsOpen(!isOpen);
      };

    return (
        <nav className={styles.hamburgerMenu}>
            <div className={styles.hamburgerDropdown}>
                <div className={`${styles.button} ${isOpen ? styles.open : ''}`} onClick={() => toggleHamburgerMenu()}>
                    <div className={styles.bar}></div>
                    <div className={styles.bar}></div>
                    <div className={styles.bar}></div>
                </div>
                    {isOpen && (
                        <div className={styles.dropdownContent} onMouseEnter={() => {setDropdownVisible(true);}} onMouseLeave={() => {setDropdownVisible(false);}}>
                            <Link href="/">Concerto</Link>
                            <Searchbar type="long" onChange={(event) => console.log("Not impmeneted yet")} />
                            <Link href={redirectURL("/add-event")}>Add Event</Link>
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
                        </div>
                    )}
            </div>
            <div className={styles.accountDropdown}>
              <div
                className={styles.profilePicture}
                onMouseEnter={() => setProfileDropdownVisible(true)}
                onMouseLeave={() => setProfileDropdownVisible(false)}
              >
                {showAccountImage()}
              </div>
              {loggedIn && profileDropdownVisible && (
                <div
                  className={styles.pofileDropdownContent}
                  onMouseEnter={() => {
                    setProfileDropdownVisible(true);
                  }}
                  onMouseLeave={() => {
                    setProfileDropdownVisible(false);
                  }}
                >
                  <Link href={redirectURL(`/accounts/${profile.userID}`)}> Show profile</Link>
                  <Link href="/settings">Settings</Link>
                  <button onClick={(event) => logOut()}>Log out</button>
                </div>
              )}
            </div>
        </nav>

    );
};

export default HamburgerMenu;