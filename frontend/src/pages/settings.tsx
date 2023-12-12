import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { useEffect, useState } from "react";
import PrivacySettings from "@/components/PrivacySettings"
import Image from "next/image";
import { User } from 'lucide-react';

const inter = Inter({ subsets: ["latin"] });

function showPicture(source: string) {
  if (source != null) {
    return <Image src={source} width={170} height={170} alt="Profile picture of user." />;
  }
  return <User fill={'black'} className={styles.userPicture} width={170} height={170} />;
}

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

  function PersonalSettings() {
    return (
      <>
        <div>
          <div className={styles.personalSettingTitle}>
            Personal information
          </div>
          <div className={styles.personalSetting}>
            <div className={styles.settingName}>
            Your e-mail:
            </div>
            <div className={styles.settingValue}>
              {user.mail}
            </div>
          </div>
          <div className={styles.personalSetting}>
            <div className={styles.settingName}>
            Your biography:
            </div>
            <div className={styles.settingValue}>
              {user.description}
            </div>
          </div>
        </div>
      </>
    );
  }

  useEffect(() => {
      fetch(environment.backendURL + `/profile`, {
        mode: "cors",
        credentials: "include",
      })
        .then((response) => {
          return response.json();
        })
        .then((responseJSON) => {
          console.log(responseJSON);
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
            <div className={styles.profilePicture}>
              {showPicture(user.image)}
            </div>
            <div className={styles.settingContainer}>
              <PersonalSettings />
              <PrivacySettings userid={user.userID} />
            </div>
        </div>
      </main>
    </>
  );
}