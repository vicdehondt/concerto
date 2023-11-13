import Image from "next/image";
import styles from "../styles/InviteCard.module.css"

function InviteCard({name, pictureSource}: {name: string, pictureSource: string}){
    return (
        <div className={styles.inviteCardContainer}>
            <div className={styles.pictureContainer}>
                <Image src={pictureSource} width={120} height={120} alt="Profile picture of friend" />
            </div>
            <div className={styles.profileNameContainer}>
                {name}
            </div>
            <div className={styles.inviteButtonContainer}>
                    <button className={styles.inviteButton}>
                        <div className={styles.inviteButtonText}>
                            invite
                        </div>
                    </button>
            </div>
        </div>
    )
}

export default InviteCard