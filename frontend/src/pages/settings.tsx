import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { useEffect, useState } from "react";
import PrivacySettings from "@/components/PrivacySettings"
import Image from "next/image";
import { User } from 'lucide-react';
import ProfilePictureUpload from "@/components/ProfilePictureUpload";
import { environment } from "@/components/Environment";
import { FormEvent } from "react";

const inter = Inter({ subsets: ["latin"] });

function showPicture(source: string) {
  if (source != null) {
    return <Image src={source} width={170} height={170} alt="Profile picture of user." />;
  }
  return <User fill={'black'} className={styles.userPicture} width={170} height={170} />;
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

  const handleMailChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUser((prevUser) => ({ ...prevUser, mail: e.target.value }));
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUser((prevUser) => ({ ...prevUser, description: e.target.value }));
  };

  async function onSaveMail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    var formData = new FormData(event.currentTarget);
    const form_values = Object.fromEntries(formData);
    const response = await fetch(environment.backendURL + "/profile/settings/mail", {
      method: "POST",
      body: formData,
      mode: "cors",
      credentials: "include",
    });
  }

  async function onSaveDescription(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    var formData = new FormData(event.currentTarget);
    const form_values = Object.fromEntries(formData);
    const response = await fetch(environment.backendURL + "/profile/settings/description", {
      method: "PATCH",
      body: formData,
      mode: "cors",
      credentials: "include",
    });
  }

  async function onSaveProfilePicture(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    var formData = new FormData(event.currentTarget);
    const form_values = Object.fromEntries(formData);
    const response = await fetch(environment.backendURL + "/profile/settings/profilepicture", {
      method: "PATCH",
      body: formData,
      mode: "cors",
      credentials: "include",
    });
  }

  function PersonalSettings() {
    return (
      <>
        <div>
          <div className={styles.personalSettingTitle}>
            Personal information
          </div>
          <div className={styles.personalSetting}>
            <form onSubmit={onSaveMail}>
              <div className={styles.settingName}>
                Your e-mail:
              </div>
              <div className={styles.settingValue}>
                {user.mail}
              </div>
              <div className={styles.changeMailText}>
                <textarea
                  id="changeMail"
                  name="changeMail"
                  value={user.mail}
                  rows={1}
                  onChange={handleMailChange}
                />
              </div>
              <button className={styles.saveButton} type="submit">Save mail</button>
            </form>
          </div>
          <div className={styles.personalSetting}>
            <form onSubmit={onSaveDescription}>
              <div className={styles.settingName}>
                Your biography:
              </div>
              <div className={styles.settingValue}>
                {user.description}
              </div>
              <div className={styles.changeDescriptionText}>
                <textarea
                  id="changeDescription"
                  name="changeDescription"
                  value={user.description}
                  rows={1}
                  onChange={handleDescriptionChange}
                />
              </div>
              <button className={styles.saveButton} type="submit">Save biography</button>
            </form>
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
              <ProfilePictureUpload picture={user.image} />
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