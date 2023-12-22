import styles from "@/styles/Hamburger.module.css";
import Image from "next/image";
import Searchbar from "./Searchbar";
import Link from "next/link";
import Notification from "./Notification";
import { useState, useEffect, useRef, ReactNode, useCallback } from "react";
import { useRouter } from "next/router";
import { X, User as LucidUser } from "lucide-react";
import { environment } from "./Environment";
import EventSearchCard from "./EventSearchCard";
import UserSearchCard from "./UserSearchCard";
import { User, Event as EventType } from "./BackendTypes";
//the Hamburger menu is used for mobile devices.
const HamburgerMenu = () => {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsHTML, setNotificationsHTML] = useState<ReactNode[]>([]);
  const [searchBoxVisible, setSearchBoxVisible] = useState(false);
  const [searchResultsHTML, setSearchResultsHTML] = useState<ReactNode[]>([]);
  const [eventSearchHTML, setEventSearchHTML] = useState<ReactNode[]>([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [profile, setProfile] = useState({ userID: 0, image: null });
  const [userIsLoggedIn, setUserIsLoggedIn] = useState(false);
  const [profileDropdownVisible, setProfileDropdownVisible] = useState(false);

  const notificationButtonRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Convert the search results from the back-end to HTML.
  // It can be a user or an event.
  const convertSearchResults = useCallback((results: Array<EventType | User>) => {
    if (results.length === 0) {
      return [<></>];
    }

    // The results are always an array with a length of 2.
    return results.map((result) => {
      if ("eventID" in result) {
        return (
          <div key={result.eventID}>
            <EventSearchCard event={result} loggedIn={userIsLoggedIn} />
          </div>
        );
      } else if ("userID" in result) {
        return (
          <div key={result.userID}>
            <UserSearchCard user={result} loggedIn={userIsLoggedIn} />
          </div>
        );
      } else {
        return [<></>];
      }
    });
  }, []);

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

  // Remove a notification from the back-end and the front-end.
  // The notificationID is used to identify the notification.
  const removeNotification = useCallback(
    (notificationID: number) => {
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
    },
    [setNotifications, setNotificationsHTML]
  );

  // When the notifications are opened and close, remove the notifications that are info notifications.
  const removeInfoNotifications = useCallback(() => {
    notifications.forEach((notification) => {
      if (notification.NotificationObject.notificationType === "friendrequestaccepted") {
        console.log("Removing notification:", notification);
        removeNotification(notification.notificationID);
      }
    });
  }, [notifications, removeNotification]);

  const convertNotifications = useCallback(
    (notifications: Array<Notification>) => {
      if (notifications.length === 0) {
        return [<div key={0}>No notifications found.</div>];
      }

      return notifications.map((notification) => (
        <div key={notification.notificationID}>
          <Notification notification={notification} removeNotification={removeNotification} />
        </div>
      ));
    },
    [removeNotification]
  );

  // Close the notifications box by updating the CSS.
  // Remove info notifications on close.
  const closeNotifications = useCallback(() => {
    const notificationBox = document.getElementsByClassName(
      styles.notificationsBox
    ) as HTMLCollectionOf<HTMLElement>;
    setNotificationsVisible(false);
    if (notificationBox && notificationBox.length > 0) {
      notificationBox[0].style.display = "none";
    }
    removeInfoNotifications();
  }, [removeInfoNotifications]);

  // Convert the notifications to HTML when the notifications change.
  useEffect(() => {
    setNotificationsHTML(convertNotifications(notifications));
  }, [notifications, convertNotifications]);

  // Close the notifications box when the user clicks outside of the box.
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
  }, [closeNotifications, notificationButtonRef, notificationsRef]);

  // Close the search box when the user clicks outside of the box.
  useEffect(() => {
    const handleOutSideClick = (event: Event) => {
      if (event.target != null && !searchRef.current?.contains(event.target as Node)) {
        closeSearchResults();
      }
    };
    window.addEventListener("mousedown", handleOutSideClick);
    return () => {
      window.removeEventListener("mousedown", handleOutSideClick);
    };
  }, [searchRef]);

  // Show or hide the search box by updating the CSS depending on the searchBoxVisible state.
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

  // Check if the user is logged in.
  async function loggedIn() {
    try {
      const response = await fetch(environment.backendURL + "/auth/status", {
        mode: "cors",
        credentials: "include",
      });
      setUserIsLoggedIn(response.status === 200);
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
          removeInfoNotifications();
        } else {
          notificationBox[0].style.display = "block";
        }
      } else {
        router.push(`/login?from=${router.asPath}`);
      }
    });
  }

  function closeSearchResults() {
    const searchBox = searchRef?.current;
    setSearchBoxVisible(false);
    if (searchBox) {
      searchBox.style.display = "none";
    }
  }

  // Redirect the user to the login page if they are not logged in.
  // Otherwise, the user is redirected to the normalURL.
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

  // Show the profile picture if the user is logged in.
  // If the user has not set a profile picture, show the default profile picture (a user icon).
  // Otherwise, show the login button.
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
        <div className={styles.account}>
          <LucidUser className={styles.userImage} width={40} height={40} color={"white"} />
        </div>
      );
    } else {
      return (
        <div className={styles.account}>
          <Image
            src={profile.image}
            style={{ objectFit: "cover" }}
            width={56}
            height={56}
            alt="Profile picture"
          />
        </div>
      );
    }
  }

  // Search the backend for users and events based on the given query.
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
        environment.backendURL +
          `/search/events/filter` +
          `?title=${query}` +
          `&limit=2` +
          `&offset=0`,
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
          setEventSearchHTML(convertSearchResults(responseJSON));
        });
    } else {
      setSearchBoxVisible(false);
    }
  }

  const toggleHamburgerMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className={styles.hamburgerMenu}>
      <div className={styles.hamburgerDropdown}>
        <div
          className={`${styles.button} ${isOpen ? styles.open : ""}`}
          onClick={() => toggleHamburgerMenu()}
        >
          <div className={styles.bar}></div>
          <div className={styles.bar}></div>
          <div className={styles.bar}></div>
        </div>
        {isOpen && (
          <div
            className={styles.dropdownContent}
            onMouseEnter={() => {
              setDropdownVisible(true);
            }}
            onMouseLeave={() => {
              setDropdownVisible(false);
            }}
          >
            <Link href="/">Concerto</Link>
            <Searchbar
              type="long"
              onClick={(query: string) => searchBackend(query)}
              onChange={(query: string) => searchBackend(query)}
            />
            <div className={styles.searchBox} ref={searchRef}>
              {searchBoxVisible && searchResultsHTML}
              {searchBoxVisible && eventSearchHTML}
            </div>
            <button onClick={(event) => redirectButtonClicked(event, "/add-event")}>
              Add Event
            </button>
            <Link className={styles.developersRedirect} href="/developers.html">
              Developers
            </Link>
            <button onClick={(event) => redirectButtonClicked(event, "/friends")}>Friends</button>
            <button onClick={(event) => redirectButtonClicked(event, "/wishlist")}>Wishlist</button>
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
        {userIsLoggedIn && profileDropdownVisible && (
          <div
            className={styles.pofileDropdownContent}
            onMouseEnter={() => {
              setProfileDropdownVisible(true);
            }}
            onMouseLeave={() => {
              setProfileDropdownVisible(false);
            }}
          >
            <button
              onClick={(event) => redirectButtonClicked(event, `/accounts/${profile.userID}`)}
            >
              {" "}
              Show profile{" "}
            </button>
            <Link href="/settings">Settings</Link>
            <button onClick={(event) => logOut()}>Log out</button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default HamburgerMenu;
