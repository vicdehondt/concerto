import Image from "next/image";
import styles from "../styles/BannerUpload.module.css";
import { useState, ChangeEvent } from "react";

function BannerUpload({ titleCallback }: { titleCallback: (string: string) => void }) {
  const [bannerSource, setBannerSource] = useState("");

  function bannerImageChosen(event: ChangeEvent<HTMLInputElement>) {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput.files && fileInput.files[0];

    if (file) {
      const source = URL.createObjectURL(file);
      setBannerSource(source);
    }
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
          <input type="text" name='title' id='title' maxLength={16} required placeholder="Title" onChange={(e) => titleCallback(e.target.value)} />
      	</div>
        <div className={styles.uploadBox}>
          <input id='banner' name='banner' type="file" required onChange={bannerImageChosen} />
        </div>
      </div>
    </>
  );
}

export default BannerUpload;
