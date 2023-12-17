import Image from "next/image";
import styles from "@/styles/Navbar.module.css";
import Link from "next/link";
import Searchbar from "./Searchbar";
import Notification from "./Notification";
import { useState, useEffect, useRef, ReactNode, useCallback } from "react";
import { useRouter } from "next/router";
import { X, User as LucidUser } from "lucide-react";
import { environment } from "./Environment";
import EventSearchCard from "./EventSearchCard";
import UserSearchCard from "./UserSearchCard";
import { User, Event as EventType } from "./BackendTypes";

function Navbar({ pictureSource }: { pictureSource: string }) {
  const router = useRouter();

  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsHTML, setNotificationsHTML] = useState<ReactNode[]>([]);
  const [searchBoxVisible, setSearchBoxVisible] = useState(false);
  const [searchResultsHTML, setSearchResultsHTML] = useState<ReactNode[]>([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [profile, setProfile] = useState({ userID: 0, image: null });
  const [userIsLoggedIn, setUserIsLoggedIn] = useState(false);

  const notificationButtonRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const convertNotifications = useCallback((notifications: Array<Notification>) => {
    if (notifications.length === 0) {
      return [<div key={0}>No notifications found.</div>];
    }

    return notifications.map((notification) => (
      <div key={notification.notificationID}>
        <Notification notification={notification} removeNotification={removeNotification} />
      </div>
    ));
  }, []);

  const convertSearchResults = useCallback((results: Array<EventType | User>) => {
    if (results.length === 0) {
      return [<></>];
    }

    return results.map((result) => {
      if ("eventID" in result) {
        return (
          <div key={result.eventID}>
            <EventSearchCard event={result} />
          </div>
        );
      } else if ("userID" in result) {
        return (
          <div key={result.userID}>
            <UserSearchCard user={result} />
          </div>
        );
      } else {
        return [<></>];
      }
    });
  }, []);

  useEffect(() => {
    setNotificationsHTML(convertNotifications(notifications));
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
    fetch(environment.backendURL + "/auth/status", {
      mode: "cors",
      credentials: "include",
    }).then((response) => {
      if (response.status == 200) {
        setUserIsLoggedIn(true);
      } else if (response.status == 400) {
        setUserIsLoggedIn(false);
      }
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

  useEffect(() => {
    const handleOutSideClick = (event: Event) => {
      if (
        event.target != null &&
        !searchRef.current?.contains(event.target as Node)
      ) {
        closeSearchResults();
      }
    };
    window.addEventListener("mousedown", handleOutSideClick);
    return () => {
      window.removeEventListener("mousedown", handleOutSideClick);
    };
  }, [searchRef]);

  useEffect(() => {
    const searchBox = searchRef?.current;
    if (searchBox) {
      if (searchBoxVisible) {
        searchBox.style.display = "block";
      } else {
        searchBox.style.display = "none";
      }
    }
  }, [searchBoxVisible]);

  async function loggedIn() {
    try {
      const response = await fetch(environment.backendURL + "/auth/status", {
        mode: "cors",
        credentials: "include",
      });
      setUserIsLoggedIn(true);
      return response.status === 200;
    } catch (error) {
      setUserIsLoggedIn(false);
      return false;
    }
  }

  function toggleNotifications() {
    fetch(environment.backendURL + "/auth/status", {
      mode: "cors",
      credentials: "include",
    }).then(async (response) => {
      const userLoggedIn = await loggedIn();
      if (userLoggedIn) {
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
    });
  }

  function closeNotifications() {
    const notificationBox = document.getElementsByClassName(
      styles.notificationsBox
    ) as HTMLCollectionOf<HTMLElement>;
    setNotificationsVisible(false);
    notificationBox[0].style.display = "none";
  }

  function closeSearchResults() {
    const searchBox = searchRef?.current;
    setSearchBoxVisible (false);
    if (searchBox) {
      searchBox.style.display = "none";
    }
  }

  const removeNotification = (notificationID: number) => {
    fetch(environment.backendURL + `/notifications/${notificationID}`, {
      method: "DELETE",
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

  async function redirectURL(normalURL: string) {
    const userLoggedIn = await loggedIn();
    if (userLoggedIn) {
      return normalURL;
    }
    return `/login?from=${encodeURIComponent(normalURL)}`;
  }

  async function redirectClicked(event: React.MouseEvent<HTMLDivElement, MouseEvent>, url: string) {
    event.preventDefault();
    const newUrl = await redirectURL(url);
    router.push(newUrl);
  }

  async function redirectButtonClicked(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    url: string
  ) {
    event.preventDefault();
    const newUrl = await redirectURL(url);
    router.push(newUrl);
  }

  function logOut() {
    fetch(environment.backendURL + "/logout", {
      method: "POST",
      mode: "cors",
      credentials: "include",
    }).then((response) => {
      if (response.status == 200) {
        router.push("/");
        router.reload();
      }
    });
  }

  function showAccountImage() {
    if (profile.userID == 0) {
      return (
        <button
          className={styles.loginButton}
          onClick={(event) => redirectButtonClicked(event, "/")}
        >
          Log In
        </button>
      );
    } else if (profile.image == null) {
      return (
        <div
          className={styles.account}
          onClick={(event) => redirectClicked(event, `/accounts/${profile.userID}`)}
        >
          <LucidUser className={styles.userImage} width={40} height={40} />
        </div>
      );
    } else {
      return (
        <div className={styles.account} onClick={(event) => redirectClicked(event, `/accounts/${profile.userID}`)}>
          <Image src={profile.image} style={{ objectFit: "cover" }} width={56} height={56} alt="Profile picture" />
        </div>
      );
    }
  }

  function searchBackend(query: string) {
    if (query.length !== 0) {
      setSearchBoxVisible(true);
      fetch(
        environment.backendURL + `/search/users` + `?username=${query}` + `&limit=2` + `&offset=0`,
        {
          mode: "cors",
          credentials: "include",
        }
      )
        .then((response) => {
          return response.json();
        })
        .then((responseJSON) => {
          console.log(responseJSON);
          setSearchResultsHTML(convertSearchResults(responseJSON));
        });

      fetch(
        environment.backendURL + `/search/events` + `?title=${query}` + `&limit=2` + `&offset=0`,
        {
          mode: "cors",
          credentials: "include",
        }
      )
        .then((response) => {
          return response.json();
        })
        .then((responseJSON) => {
          console.log(responseJSON);
        });
    } else {
      setSearchBoxVisible(false);
    }
  }

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.leftTopics}>
          <Link href="/">Concerto</Link>
          <Searchbar type="long" onClick={(query: string) => searchBackend(query)} onChange={(query: string) => searchBackend(query)} />
          <div className={styles.searchBox} ref={searchRef}>
            {searchBoxVisible && searchResultsHTML}
          </div>
          <div className={styles.addEventButton}>
            <div className={styles.add} onClick={(event) => redirectClicked(event, "/add-event")}>
              +
            </div>
          </div>
        </div>
        <div className={styles.rightTopics}>
          <div
            className={styles.friendsRedirect}
            onClick={(event) => redirectClicked(event, "/friends")}
          >
            Friends
          </div>
          <div
            className={styles.wishlistRedirect}
            onClick={(event) => redirectClicked(event, "/wishlist")}
          >
            Wishlist
          </div>
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
            {userIsLoggedIn && dropdownVisible && (
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
