import Image from "next/image";
import styles from "@/styles/Home.module.css";
import { useState, FormEvent, ChangeEvent, useEffect } from "react";
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
    if (file) {
      const source = URL.createObjectURL(file);
      setPictureSource(source);
    }
  }

  async function onSaveProfilePicture(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    var formData = new FormData(event.currentTarget);
    const form_values = Object.fromEntries(formData);
    const response = await fetch(environment.backendURL + "/profile/settings/personal/profilepicture", {
      method: "PATCH",
      body: formData,
      mode: "cors",
      credentials: "include",
    });
    if (response.status == 200){
      alert("Your profile picture has been changed.")
    } else{
      alert("Something went wrong while changing your profile picture.")
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
        <form onSubmit={onSaveProfilePicture}>
          {picture ? (<input id='picture' name='picture' type="file" accept="image/png, image/jpg, image/jpeg" onChange={ImageChosen} />) : (<input id='picture' name='picture' type="file" accept="image/png, image/jpg, image/jpeg" required onChange={ImageChosen} />)}
          <button className={styles.saveButton} type="submit">Save</button>
        </form>
      </div>
    </>
  );
}

export default ProfilePictureUpload;
