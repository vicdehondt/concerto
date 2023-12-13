import Image from "next/image";
import styles from "@/styles/BannerUpload.module.css";
import { useState, ChangeEvent, useEffect } from "react";

type BannerUploadProps = {
  banner?: string;
  title?: string;
  titleCallback: (string: string) => void;
};

function BannerUpload({ title, banner, titleCallback }: BannerUploadProps) {
  const [bannerSource, setBannerSource] = useState("");

  useEffect(() => {
    if (banner) {
      setBannerSource(banner);
    }
  }, [banner]);

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
          {title ? (
            <input type="text" name='title' id='title' maxLength={16} required placeholder="Title" defaultValue={title} onChange={(e) => titleCallback(e.target.value)} />
          ) : (
            <input type="text" name='title' id='title' maxLength={16} required placeholder="Title" onChange={(e) => titleCallback(e.target.value)} />
          )}
      	</div>
        <div className={styles.uploadBox}>
          {banner ? (<input id='banner' name='banner' type="file" onChange={bannerImageChosen} />) : (<input id='banner' name='banner' type="file" required onChange={bannerImageChosen} />)}
        </div>
      </div>
    </>
  );
}

export default BannerUpload;
