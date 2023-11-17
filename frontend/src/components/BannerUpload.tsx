import Image from "next/image";
import styles from "../styles/BannerUpload.module.css";
import { useState } from "react";

function BannerUpload() {
  const [bannerSource, setBannerSource] = useState("");

  function bannerImageChosen(event) {
    console.log(event.target.files[0]);
    const file = event.target.files[0];
    const source = URL.createObjectURL(file);
    setBannerSource(source);
  }

  function showBanner() {
    if (bannerSource.length != 0) {
      return <Image src={bannerSource}
        className={styles.bannerImage}
        style={{ objectFit: "cover" }}
        fill={true}
        alt="Banner of the concert" />
    }
  }

  return (
    <>
      <div className={styles.bannerContainer}>
        {showBanner()}
				<div className={styles.titleContainer}>
          <input type="text" name='title' id='title' maxLength={16} required placeholder="Title" />
      	</div>
        <div className={styles.uploadBox}>
          <input id='banner' name='banner' type="file" required onChange={bannerImageChosen} />
        </div>
      </div>
    </>
  );
}

export default BannerUpload;
