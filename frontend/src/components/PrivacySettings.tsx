import styles from "@/styles/PrivacySettings.module.css";
import PrivacySetting from "./PrivacySetting";
import { useEffect, useState } from "react";
import { FormEvent } from "react";
import { environment } from "./Environment";

export default function PrivacySettings(userid: { userid: number}) {
  const [loading, setLoading] = useState(true);
  const [privacySettings, setPrivacySettings] = useState({
    privacyAttendedEvents: "",
    privacyCheckedInEvents: "",
    privacyFriends: "",
  })
  const [initialprivacySettings, setinitialPrivacySettings] = useState({
    privacyAttendedEvents: "",
    privacyCheckedInEvents: "",
    privacyFriends: "",
  })

  async function onSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    var formData = new FormData(event.currentTarget);
    const form_values = Object.fromEntries(formData);
    const response = await fetch(environment.backendURL + "/profile/settings/privacy", {
      method: "POST",
      body: formData,
      mode: "cors",
      credentials: "include",
    });
  }

  useEffect(() => {
    fetch(environment.backendURL + `/profile/settings/privacy`, {
      mode: "cors",
      credentials: "include",
    })
      .then((response) => {
        return response.json();
      })
      .then((responseJSON) => {
        setPrivacySettings(responseJSON);
        setinitialPrivacySettings(responseJSON);
        setLoading(false);
      });
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
