import styles from "../styles/FriendInvite.module.css"

import InviteCard from "@/components/InviteCard"

function FriendInvites() {
    return (
        <div className={styles.gridContainer}>
            <InviteCard name="Reinout Cloosen" pictureSource="/photos/Rombout.jpeg"/>
            <InviteCard name="Dante Tibollo" pictureSource="/photos/Rombout.jpeg"/>
        </div>
    )
}

export default FriendInvites