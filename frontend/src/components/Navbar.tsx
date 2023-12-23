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
import { User, Event as EventType, Profile } from "./BackendTypes";
import { handleFetchError } from "./ErrorHandler";

function Navbar() {
  const router = useRouter();

  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsHTML, setNotificationsHTML] = useState<ReactNode[]>([]);
  const [searchBoxVisible, setSearchBoxVisible] = useState(false);
  const [searchResultsHTML, setSearchResultsHTML] = useState<ReactNode[]>([]);
  const [eventSearchHTML, setEventSearchHTML] = useState<ReactNode[]>([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userIsLoggedIn, setUserIsLoggedIn] = useState(false);

  const notificationButtonRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Convert the search results from the back-end to HTML.
  // It can be a user or an event.
  function convertSearchResults(results: Array<EventType | User>) {
    console.log("results: ", results);

    if (results.length == 0) {
      return [];
    }

    // The results are always an array with a length of 2.
    return results.map((result) => {
      console.log("eventID in result: ", "eventID" in result);
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
  }

  // Fetch the notifications and profile upon initialising.
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch(environment.backendURL + "/notifications", {
          mode: "cors",
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setNotifications(data);
        } else {
          setNotifications([]);
        }
      } catch (error) {
        handleFetchError(error, router);
      }
    };

    const fetchProfile = async () => {
      try {
        const response = await fetch(environment.backendURL + "/profile", {
          mode: "cors",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        } else {
          setProfile(null);
        }
      } catch (error) {
        handleFetchError(error, router);
      }
    };

    const loggedIn = async () => {
      console.log("test");
      try {
        const response = await fetch(environment.backendURL + "/auth/status", {
          mode: "cors",
          credentials: "include",
        });

        setUserIsLoggedIn(response.ok);
      } catch (error) {
        handleFetchError(error, router);
      }
    };

    fetchNotifications();
    fetchProfile();
    loggedIn();
  }, []);

  // Remove a notification from the back-end and the front-end.
  // The notificationID is used to identify the notification.
  const removeNotification = useCallback(
    (notificationID: number) => {
      const fetchNotifications = async () => {
        try {
          const response = await fetch(
            environment.backendURL + `/notifications/${notificationID}`,
            {
              method: "DELETE",
              mode: "cors",
              credentials: "include",
            }
          );

          if (response.ok) {
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
          }
        } catch (error) {
          handleFetchError(error, router);
        }
      };

      fetchNotifications();
    },
    [setNotifications, setNotificationsHTML]
  );

  // When the notifications are opened and close, remove the notifications that are info notifications.
  const removeInfoNotifications = useCallback(() => {
    notifications.forEach((notification) => {
      if (notification.NotificationObject.notificationType === "friendrequestaccepted") {
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
    notificationBox[0].style.display = "none";
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
    console.log("Changed: ", searchBoxVisible);
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
      setUserIsLoggedIn(response.status == 200);
      return response.status == 200;
    } catch (error) {
      handleFetchError(error, router);
    }
  }

  async function toggleNotifications() {
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
      router.push(`/login?from=${encodeURIComponent(router.asPath)}`);
    }
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

  async function logOut() {
    try {
      const response = await fetch(environment.backendURL + "/logout", {
        method: "POST",
        mode: "cors",
        credentials: "include",
      });

      if (response.ok) {
        setUserIsLoggedIn(false);
        router.push("/");
      }
    } catch (error) {
      handleFetchError(error, router);
    }
  }

  // Show the profile picture if the user is logged in.
  // If the user has not set a profile picture, show the default profile picture (a user icon).
  // Otherwise, show the login button.
  function showAccountImage() {
    if (profile) {
      if (profile.image) {
        return (
          <div
            className={styles.account}
            onClick={(event) => redirectClicked(event, `/accounts/${profile.userID}`)}
          >
            <Image
              src={profile.image}
              style={{ objectFit: "cover" }}
              width={56}
              height={56}
              alt="Profile picture"
            />
          </div>
        );
      } else {
        return (
          <div
            className={styles.account}
            onClick={(event) => redirectClicked(event, `/accounts/${profile.userID}`)}
          >
            <LucidUser className={styles.userImage} width={40} height={40} />
          </div>
        );
      }
    } else {
      return (
        <button
          className={styles.loginButton}
          onClick={(event) => redirectButtonClicked(event, router.asPath)}
        >
          Log In
        </button>
      );
    }
  }

  // Search the backend for users and events based on the given query.
  async function searchBackend(query: string) {
    if (query.length !== 0) {
      setSearchBoxVisible(true);
      try {
        const response = await fetch(
          environment.backendURL +
            `/search/users` +
            `?username=${query}` +
            `&limit=2` +
            `&offset=0`,
          {
            mode: "cors",
            credentials: "include",
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log("response: ", data);
          const convertedResults = convertSearchResults(data);
          setSearchResultsHTML(convertedResults);
          console.log(convertedResults);
        }
      } catch (error) {
        handleFetchError(error, router);
      }

      try {
        const response = await fetch(
          environment.backendURL + `/search/events` + `?title=${query}` + `&limit=2` + `&offset=0`,
          {
            mode: "cors",
            credentials: "include",
          }
        );

        if (response.ok) {
          const data = await response.json();
          setEventSearchHTML(convertSearchResults(data));
        }
      } catch (error) {
        handleFetchError(error, router);
      }
    } else {
      setSearchBoxVisible(false);
    }
  }

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.leftTopics}>
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
          <div className={styles.addEventButton}>
            <div className={styles.add} onClick={(event) => redirectClicked(event, "/add-event")}>
              +
            </div>
          </div>
        </div>
        <div className={styles.rightTopics}>
          <Link className={styles.developersRedirect} href="/developers.html">
            Developers
          </Link>
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
