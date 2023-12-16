import styles from "@/styles/PrivacySetting.module.css";

const options = ["public", "friends", "private"];

export default function PrivacySetting({name, setting, initial}: {name: string, setting: string, initial: string}) {
  return (
    <div  key={setting} className={styles.setting}>
        <div className={styles.settingName}>
            {name}
        </div>
        <select id={setting} name={setting} className={styles.settingValue} defaultValue={initial}>
            {options.map((value, index) => {
                console.log(initial)
                return (
                    <option key={index} value={value}> {value} </option>
                )
            })}
        </select>
    </div>
  )
}
