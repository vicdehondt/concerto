import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { useEffect, useState } from "react";
import PrivacySettings from "@/components/PrivacySettings"
import ProfilePictureUpload from "@/components/ProfilePictureUpload";
import { environment } from "@/components/Environment";
import { handleFetchError } from "@/components/ErrorHandler";
import { useRouter } from "next/router";
import { FormEvent } from "react";
import { User } from "@/components/BackendTypes";

const inter = Inter({ subsets: ["latin"] });

export default function Settings() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  async function onSaveMail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    var formData = new FormData(event.currentTarget);
    const response = await fetch(environment.backendURL + "/profile/settings/personal/mail", {
      method: "POST",
      body: formData,
      mode: "cors",
      credentials: "include",
    });
    if (response.status == 200){
      alert("Your mail has been changed.")
    } else{
      alert("Something went wrong while saving your mail.")
    }
  }

  async function onSaveDescription(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    var formData = new FormData(event.currentTarget);
    const form_values = Object.fromEntries(formData);
    const response = await fetch(environment.backendURL + "/profile/settings/personal/description", {
      method: "PATCH",
      body: formData,
      mode: "cors",
      credentials: "include",
    });
    if (response.status == 200){
      alert("Your biography has been changed.")
    } else{
      alert("Something went wrong while saving your biography.")
    }
  }

  async function onSavePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    var formData = new FormData(event.currentTarget);
    console.log(formData);
    const form_values = Object.fromEntries(formData);
    const response = await fetch(environment.backendURL + "/profile/settings/personal/password", {
      method: "PATCH",
      body: formData,
      mode: "cors",
      credentials: "include",
    });
    if (response.status == 200){
      alert("Your password has been changed.")
    } else{
      alert("Something went wrong while changing your password.")
    }
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
                {user && user.mail}
              </div>
              <div className={styles.changeText}>
                <input className={styles.settingsInput}
                  type="email"
                  id="mail"
                  name="mail"
                  placeholder="Change e-mail address"
                />
              </div>
              <button className={styles.saveButton} type="submit">Save mail</button>
            </form>
          </div>
          <div className={styles.personalSetting}>
            <div className={styles.settingName}>
            Change Password:
            </div>
            <form onSubmit={onSavePassword}>
                <div className={styles.changeText}>
                  <input
                    className={styles.settingsInput}
                    type="password"
                    name="oldPassword"
                    id="oldPassword"
                    placeholder="Your old password"
                    pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}"
                  />
                </div>
                <div className={styles.changeText}>
                  <input
                    className={styles.settingsInput}
                    type="password"
                    name="newPassword"
                    id="newPassword"
                    placeholder="Your new password"
                    pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}"
                  />
                </div>
              <button className={styles.saveButton} type="submit">Save new password</button>
            </form>
          </div>
          <div className={styles.personalSetting}>
            <form onSubmit={onSaveDescription}>
              <div className={styles.settingName}>
                Your biography:
              </div>
              <div className={styles.settingValue}>
                {user && user.description}
              </div>
              <div className={styles.changeText}>
                <textarea className={styles.changeBiographyContainer}
                  id="description"
                  name="description"
                  rows={3}
                  placeholder="Change your biography"
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
    const fetchProfile = async () => {
      try {
        const response = await fetch(environment.backendURL + "/profile", {
          mode: "cors",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data);
        }
      } catch (error) {
        handleFetchError(error, router);
      }
    };
    fetchProfile();
  }, []);

  return (
    <>
      <Head>
        <title>Concerto | Settings</title>
        <meta name="description" content="Your Account." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <div className={[styles.page, styles.settingsPage].join(" ")}>
            <div className={styles.profilePicture}>
              {user && <ProfilePictureUpload picture={user.image} />}
            </div>
            <div className={styles.settingContainer}>
              <PersonalSettings />
              {user && <PrivacySettings userid={user.userID} />}
            </div>
        </div>
      </main>
    </>
  );
}