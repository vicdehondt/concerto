import Image from "next/image";
import styles from "@/styles/BannerUpload.module.css";
import { useState, ChangeEvent, useEffect } from "react";

// Banner and title are conditional.
// On the edit page, the user wants to see what the current fields are.
// When title and banner are given, the banner is initialised with both.
type BannerUploadProps = {
  banner?: string;
  title?: string;
  titleCallback: (string: string) => void;
};

function BannerUpload({ title, banner, titleCallback }: BannerUploadProps) {
  const [bannerSource, setBannerSource] = useState("");

  // Check if banner is given and set the useState if it is.
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

  // Show the banner image based on the useState.
  function showBanner() {
    if (bannerSource.length != 0) {
      return (
        <Image
          src={bannerSource}
          className={styles.bannerImage}
          style={{ objectFit: "cover" }}
          fill={true}
          alt="Banner of the concert"
        />
      );
    }
  }

  // The file upload only allows PNG and JPG.
  return (
    <>
      <div className={styles.bannerContainer}>
        {showBanner()}
        <div className={styles.titleContainer}>
          {title ? (
            <input
              type="text"
              name="title"
              id="title"
              maxLength={16}
              required
              placeholder="Title"
              defaultValue={title}
              onChange={(e) => titleCallback(e.target.value)}
            />
          ) : (
            <input
              type="text"
              name="title"
              id="title"
              maxLength={16}
              required
              placeholder="Title"
              onChange={(e) => titleCallback(e.target.value)}
            />
          )}
        </div>
        <div className={styles.uploadBox}>
          {banner ? (
            <input
              id="banner"
              name="banner"
              type="file"
              accept="image/png, image/jpg, image/jpeg"
              onChange={bannerImageChosen}
            />
          ) : (
            <input
              id="banner"
              name="banner"
              type="file"
              accept="image/png, image/jpg, image/jpeg"
              required
              onChange={bannerImageChosen}
            />
          )}
        </div>
      </div>
    </>
  );
}

export default BannerUpload;
