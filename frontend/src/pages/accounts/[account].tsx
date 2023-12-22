import Head from "next/head";
import { useRouter } from "next/router";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { useEffect, useState } from "react";
import Biography from "@/components/Biography";
import UserEvent from "@/components/UserEvent";
import { Event, User } from "@/components/BackendTypes";
import { environment } from "@/components/Environment";
import { handleFetchError } from "@/components/ErrorHandler";

const inter = Inter({ subsets: ["latin"] });

export default function Account() {
  const [user, setUser] = useState<User | null>(null);
  const [checkedevents, setcheckedEvents] = useState([]);
  const [attendedevents, setAttendedEvents] = useState([]);
  const [checkedInPrivacy, setCheckedInPrivacy] = useState(true);
  const [profile, setProfile] = useState(false);

  const router = useRouter();

  async function requestCheckins(user: User) {
    try {
      const response = await fetch(environment.backendURL + "/users" + `/${user.userID}/checkins`, {
        mode: "cors",
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setcheckedEvents(data);
      } else {
        setCheckedInPrivacy(false);
      }
    } catch (error) {
      handleFetchError(error, router);
    }
  }

  async function requestAttended(user: User) {
    try {
      const response = await fetch(environment.backendURL + "/users" + `/${user.userID}/attended`, {
        mode: "cors",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setAttendedEvents(data);
      } else {
        setCheckedInPrivacy(false);
      }

    } catch (error) {
      handleFetchError(error, router);
    }
  }

  function showCheckins(response: Array<Event>) {
    if (!checkedInPrivacy) {
      return <div>Not allowed to see this information.</div>;
    } else if (response.length > 0) {
      return response.map((event: Event) => (
        <div key={event.eventID}>
          <UserEvent event={event} />
        </div>
      ));
    } else {
      return <></>;
    }
  }

  useEffect(() => {
    const id = router.query.account;
    const fetchUser = async () => {
      try {
        const response = await fetch(environment.backendURL + "/users" + `/${id}`, {
          mode: "cors",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data);
          requestCheckins(data);
          requestAttended(data);
          fetchProfile();
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
          setProfile(data.userID == id);
        }
      } catch (error) {
        handleFetchError(error, router);
      }
    };
    if (id) {
      fetchUser();
    }
  }, [router.query.account]);
  return (
    <>
      <Head>
        <title>Concerto | {profile ? "Profile" : "Profile of " + user?.username}</title>
        <meta name="description" content="Your Account." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <div className={[styles.page, styles.accountPage].join(" ")}>
          <div className={styles.biographyContainer}>
            {user && (
              <Biography
                user={user}
                source={user.image}
                username={user.username}
                description={user.description}
              />
            )}
          </div>
          <div className={styles.attendedEventsContainer}>{showCheckins(checkedevents)}</div>
          <div className={styles.pastEventsContainer}>{showCheckins(attendedevents)}</div>
        </div>
      </main>
    </>
  );
}
