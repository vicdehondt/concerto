import Image from "next/image";
import styles from "@/styles/ProfilePictureUpload.module.css";
import { useState, ChangeEvent, useEffect } from "react";
import { User } from 'lucide-react';
import { environment } from "@/components/Environment";

type ProfilePictureUploadProps = {
  picture?: string;
};

function ProfilePictureUpload({ picture }: ProfilePictureUploadProps) {
  const [pictureSource, setPictureSource] = useState("");

  useEffect(() => {
    if (picture) {
      setPictureSource(picture);
    }
  }, [picture]);

  async function ImageChosen(event: ChangeEvent<HTMLInputElement>) {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput.files && fileInput.files[0];
    const formData = new FormData();
    if (file) {
        formData.append("picture", file);
    }
    const response = await fetch(environment.backendURL + "/profile/profilepicture", {
        method: "POST",
        body: formData,
        mode: "cors",
        credentials: "include",
      });

    if (file) {
      const source = URL.createObjectURL(file);
      setPictureSource(source);
    }
  }

  function showBanner() {
    if (pictureSource.length != 0) {
      return  <Image style={{ objectFit: "cover" }} src={pictureSource} width={170} height={170} alt="Profile picture of user." />;
    } else {
        return <User fill={'black'} className={styles.userPicture} width={170} height={170} />
    }
  }

  return (
    <>
      <div className={styles.bannerContainer}>
        {showBanner()}
        <div className={styles.uploadBox}>
          {picture ? (<input id='picture' name='picture' type="file" accept="image/png, image/jpg, image/jpeg" onChange={ImageChosen} />) : (<input id='banner' name='banner' type="file" accept="image/png, image/jpg, image/jpeg" required onChange={ImageChosen} />)}
        </div>
      </div>
    </>
  );
}

export default ProfilePictureUpload;
