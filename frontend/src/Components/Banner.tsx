import Image from "next/image";
import styles from "../styles/Banner.module.css";

function Banner({imageSource, concertName}: {imageSource: string, concertName: string}) {
    return (
        <div className={styles.container}>
            <div>
                <Image src={imageSource} style={{objectFit:"cover"}}  fill={true} alt="Banner of the concert"/>
            </div>
            <div className={styles.titleContainer}>
                <div className={styles.concertTitle}>
                    {concertName}
                </div>
            </div>
        </div>
    );
}

export default Banner

