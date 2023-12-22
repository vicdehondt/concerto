import styles from "@/styles/PrivacySettings.module.css";
import PrivacySetting from "./PrivacySetting";
import { useEffect, useState } from "react";
import { FormEvent } from "react";
import { environment } from "./Environment";
import { handleFetchError } from "./ErrorHandler";
import { useRouter } from "next/router";

export default function PrivacySettings(userid: { userid: number}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [privacySettings, setPrivacySettings] = useState({
    privacyAttendedEvents: "",
    privacyCheckedInEvents: "",
    privacyFriends: "",
  })

  async function onSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    try {
      const response = await fetch(environment.backendURL + "/profile/settings/privacy", {
        method: "POST",
        body: formData,
        mode: "cors",
        credentials: "include",
      });

      if (response.ok){
        alert("Your privacy settings have been changed.")
      } else{
        alert("Something went wrong while saving your privacy settings.")
      }
    } catch (error) {
      handleFetchError(error, router);
    }
  }

  useEffect(() => {

    const fetchProfile = async () => {
      try {
        const response = await fetch(environment.backendURL + `/profile/settings/privacy`, {
          mode: "cors",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setPrivacySettings(data);
          setLoading(false);
        }
      } catch (error) {
        handleFetchError(error, router);
      }
      fetchProfile();
    };
},  []);

  return (
    <div className={styles.settingContainer}>
      {loading ? (
      <p>Loading...</p>
    ) : (
      <form onSubmit={onSave}>
        <div className={styles.title}>
          Privacy Settings
        </div>
        <div className={styles.explanation}>
          Decide who can see this information
        </div>
        <PrivacySetting name={"Events you attended"} setting={"privacyAttendedEvents"} initial={privacySettings.privacyAttendedEvents} />
        <PrivacySetting name={"Upcoming events you have checked in"} setting={"privacyCheckedInEvents"} initial={privacySettings.privacyCheckedInEvents} />
        <PrivacySetting name={"Your friends"} setting={"privacyFriends"} initial={privacySettings.privacyFriends} />
        <button className={styles.saveButton} type="submit">Save Privacy Settings</button>
      </form>
    )}
    </div>
  );
}
