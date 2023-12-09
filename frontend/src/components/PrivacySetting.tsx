import styles from "../styles/PrivacySetting.module.css";
import { useEffect, useState } from "react";

const environment = {
  backendURL: "http://localhost:8080",
};
if (process.env.NODE_ENV == "production") {
  environment.backendURL = "https://api.concerto.dehondt.dev";
}

const options = ["public", "friends", "private"];

export default function PrivacySetting({name, setting, initial}: {name: string, setting: string, initial: string}) {
  return (
    <div  key={setting} className={styles.setting}>
        <div className={styles.settingName}>
            {name}
        </div>
        <select id={setting} name={setting} className={styles.settingValue} defaultValue={initial}>
            {options.map((value) => {
                console.log(initial)
                return (
                    <option value={value}> {value} </option>
                )
            })}
        </select>
    </div>
  )
}
