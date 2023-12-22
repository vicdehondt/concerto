import Image from "next/image";
import styles from "@/styles/Banner.module.css";

type BannerProps = {
  imageSource: string;
  concertName: string;
}

// Show a banner with the title of a concert and the image of the concert.
function Banner({ imageSource, concertName }: BannerProps) {
  return (
    <>
      <div className={styles.bannerContainer}>
        <Image
					className={styles.bannerImage}
          src={imageSource}
          style={{ objectFit: "cover" }}
          fill={true}
          alt="Banner of the concert"
        />
				<div className={styles.titleContainer}>
        	<div className={styles.concertTitle}>{concertName}</div>
      	</div>
      </div>
    </>
  );
}

export default Banner;
