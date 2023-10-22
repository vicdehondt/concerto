import Image from "next/image";
import styles from "../styles/FriendCard.module.css";

function Banner({imageSource, concertName}: {imageSource: string, concertName: string}) {
    return (
        <div className={styles.container}>
            <Image src={imageSource} objectFit="cover"  fill={true} alt="Banner of the concert"/>
            <div className={styles.concertTitle}>
                {concertName}
            </div>
        </div>
    );
}

export default Banner

