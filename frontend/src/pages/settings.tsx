import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { useEffect, useState } from "react";
import UserSettings from "@/components/UserSettings"

const inter = Inter({ subsets: ["latin"] });

const environment = {
  backendURL: "http://localhost:8080",
};
if (process.env.NODE_ENV == "production") {
  environment.backendURL = "https://api.concerto.dehondt.dev";
}

type User = {
  username: string;
  userID: number;
  mail: string;
  image: string;
  privacyAttendedEvents: string;
  privacyCheckedInEvents: string;
  privacyFriends: string;
  description: string;
}

export default function Settings() {
  const [user, setUser] = useState({
    username: "",
    userID: 0,
    mail: "",
    image: "",
    privacyAttendedEvents: "",
    privacyCheckedInEvents: "",
    privacyFriends: "",
    description: "",
  });


  useEffect(() => {
      fetch(environment.backendURL + `/profile`, {
        mode: "cors",
        credentials: "include",
      })
        .then((response) => {
          return response.json();
        })
        .then((responseJSON) => {
          setUser(responseJSON);
        });
  }, []);

  return (
    <>
      <Head>
        <title>Concerto | Account</title>
        <meta name="description" content="Your Account." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
      <div className={[styles.page, styles.settingsPage].join(" ")}>
          <div className={styles.settingContainer}>
            <UserSettings
            userid={user.userID}
            />
          </div>
          <div className={styles.accountOverviewContainer}>
            account overview
          </div>
      </div>
      </main>
    </>
  );
}