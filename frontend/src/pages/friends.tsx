import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import SideBar from "../components/SideBar";
import FriendCard from "../components/FriendCard";
import { useEffect, useState } from "react";

const inter = Inter({ subsets: ["latin"] });

const environment = {
  backendURL: "http://localhost:8080",
};
if (process.env.NODE_ENV == "production") {
  environment.backendURL = "https://api.concerto.dehondt.dev";
}

type Friend = {
  userID: number;
  username: string;
  image: string;
};

export default function Friends() {

  const [friends, setFriends] = useState([]);

  function showFriends(response: Array<Friend>) {
    var key = 0;
    return response.map((friend) => {
      key += 1;
      return <FriendCard key={key} source={friend.image} username={friend.username} />
    })
  }

  useEffect(() => {
    fetch(environment.backendURL + "/friends", {
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
        setFriends(responseJSON);
      });
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
          <SideBar type="friends" />
          <div className={styles.pageContent}>
            <div className={styles.title}>
              <h1>Friends</h1>
            </div>
            <div className={styles.friendsContainer}>
              {showFriends(friends)}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
