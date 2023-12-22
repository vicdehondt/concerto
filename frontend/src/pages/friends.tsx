import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import SideBar from "@/components/SideBar";
import FriendCard from "@/components/FriendCard";
import { useEffect, useState } from "react";
import { Friend } from "@/components/BackendTypes";
import { environment } from "@/components/Environment";
import { handleFetchError } from "@/components/ErrorHandler";
import { useRouter } from "next/router";

const inter = Inter({ subsets: ["latin"] });

export default function Friends() {

  const router = useRouter();
  const [friends, setFriends] = useState([]);
  const [search, setSearch] = useState("");

  function showFriends(response: Array<Friend>) {
    var key = 0;
    return response.map((friend) => {
      key += 1;
      return <FriendCard key={key} friend={friend} />
    })
  }

  function showFilteredFriends(response: Array<Friend>) {
    const filtered = response.filter((friend) => {
      return friend.username.toLowerCase().includes(search.toLowerCase());
    });
    var key = 0;
    return filtered.map((friend) => {
      key += 1;
      return <FriendCard key={key} friend={friend} />
    })
  }

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await fetch(environment.backendURL + "/friends", {
          mode: "cors",
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setFriends(data);
        } else {
          setFriends([]);
        }
      } catch (error) {
        handleFetchError(error, router);
      }
    };
    fetchFriends();
  }, []);

  return (
    <>
      <Head>
        <title>Concerto | Friends</title>
        <meta name="description" content="Your friends." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <div className={[styles.page, styles.friendsPage].join(" ")}>
          <SideBar type="friends" queryCallback={(string) => setSearch(string)} />
          <div className={styles.pageContent}>
            <div className={styles.title}>
              <h1>Friends</h1>
            </div>
            <div className={styles.friendsContainer}>
              {(search == "") && showFriends(friends)}
              {(search != "") && showFilteredFriends(friends)}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
