import styles from "../styles/Settings.module.css";
import PrivacySetting from "./PrivacySetting";
import { useEffect, useState } from "react";
import { FormEvent } from "react";

const environment = {
  backendURL: "http://localhost:8080",
};
if (process.env.NODE_ENV == "production") {
  environment.backendURL = "https://api.concerto.dehondt.dev";
}

export default function UserSettings(userid: { userid: number}) {
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

  async function onDiscard() {
    console.log("Discarding settings");
    setPrivacySettings(initialprivacySettings);
    console.log("Original settings: ", initialprivacySettings);
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
        <PrivacySetting name={"Events you attended"} setting={"privacyAttendedEvents"} initial={privacySettings.privacyAttendedEvents} />
        <PrivacySetting name={"Upcoming events you have checked in"} setting={"privacyCheckedInEvents"} initial={privacySettings.privacyCheckedInEvents} />
        <PrivacySetting name={"Your friends"} setting={"privacyFriends"} initial={privacySettings.privacyFriends} />
        <div className={styles.saveButton} >
          <button onClick={onDiscard}>
            Discard settings
          </button>
          <button type="submit">
            Save settings
          </button>
        </div>
      </form>
    )}
    </div>
  );
}
