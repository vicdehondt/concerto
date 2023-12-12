import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/EventCardUpload.module.css";
import Tag from "@/components/Tag";
import Link from "next/link";
import { ChangeEvent, useEffect, useState } from "react";

function getMonth(month: number) {
  switch (month) {
    case 0:
      return "January";
    case 1:
      return "February";
    case 2:
      return "March";
    case 3:
      return "April";
    case 4:
      return "May";
    case 5:
      return "June";
    case 6:
      return "July";
    case 7:
      return "August";
    case 8:
      return "September";
    case 9:
      return "October";
    case 10:
      return "November";
    case 11:
      return "December";
  }
}

type EventCardUploadProps = {
  title: string;
  location: string;
  date: string;
  time: string;
  price: number;
  image?: string;
  genre1?: string;
  genre2?: string;
};

function EventCardUpload({ title, location, date, time, price, image, genre1, genre2 }: EventCardUploadProps) {

  useEffect(() => {
    if (image && image != "string") {
      seteventPictureSource(image);
    }
  }, [image]);

  function convertDate(date: string) {
    const convertedDate = new Date(date);
    const year = convertedDate.getFullYear();
    const month = getMonth(convertedDate.getMonth());
    const day = convertedDate.getDate();

    return [[month, day].join(" "), year].join(", ");
  }

  const [eventPictureSource, seteventPictureSource] = useState("");

  function bannerImageChosen(event: ChangeEvent<HTMLInputElement>) {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput.files && fileInput.files[0];

    if (file) {
      const source = URL.createObjectURL(file);
      seteventPictureSource(source);
    }
  }

  function showEventPicture() {
    if (eventPictureSource.length != 0) {
      return <Image src={eventPictureSource}
        style={{ objectFit: "cover" }}
        width={120}
        height={120}
        alt="Performer" />
    }
  }

  const genreOptions = [
    <option key={"Afrobeat"} id="Afrobeat" value="Afrobeat">Afrobeat</option>,
    <option key={"Afropop"} id="Afropop" value="Afropop">Afropop</option>,
    <option key={"Alternative"} id="Alternative" value="Alternative">Alternative</option>,
    <option key={"Bigband"} id="Bigband" value="Bigband">Bigband</option>,
    <option key={"Blues"} id="Blues" value="Blues">Blues</option>,
    <option key={"Classical"} id="Classical" value="Classical">Classical</option>,
    <option key={"Comedy"} id="Comedy" value="Comedy">Comedy</option>,
    <option key={"Country"} id="Country" value="Country">Country</option>,
    <option key={"Dance"} id="Dance" value="Dance">Dance</option>,
    <option key={"Electronic"} id="Electronic" value="Electronic">Electronic</option>,
    <option key={"Folk"} id="Folk" value="Folk">Folk</option>,
    <option key={"Hiphop/Rap"} id="Hiphop/Rap" value="Hiphop/Rap">Hiphop/Rap</option>,
    <option key={"J-Pop"} id="J-Pop" value="J-Pop">J-Pop</option>,
    <option key={"Jazz"} id="Jazz" value="Jazz">Jazz</option>,
    <option key={"K-Pop"} id="K-Pop" value="K-Pop">K-Pop</option>,
    <option key={"Latin"} id="Latin" value="Latin">Latin</option>,
    <option key={"Metal"} id="Metal" value="Metal">Metal</option>,
    <option key={"New Age"} id="New Age" value="New Age">New Age</option>,
    <option key={"Pop"} id="Pop" value="Pop">Pop</option>,
    <option key={"Punk"} id="Punk" value="Punk">Punk</option>,
    <option key={"Reggae"} id="Reggae" value="Reggae">Reggae</option>,
    <option key={"Rock"} id="Rock" value="Rock">Rock</option>,
    <option key={"Singer-songwriter"} id="Singer-songwriter" value="Singer-songwriter">Singer-songwriter</option>,
    <option key={"Soundtrack"} id="Soundtrack" value="Soundtrack">Soundtrack</option>]

  function options(genre: string) {
    const chooseOption = <option key={"choose"} id="choose" hidden value="">Choose genre</option>;
    if (genre == "") {
      return [chooseOption, ...genreOptions];
    }
    return genreOptions.map((option) => {
      if (option.props.value == genre) {
        return (
          <option key={option.props.id} id={option.props.id} value={option.props.value} selected>
            {option.props.value}
          </option>
        );
      }
      return option;
    });
  }

  function showSelection(name: string) {
    if (name == "mainGenre")  {
      if (genre1 && genre1.length != 0) {
        return (
          <select name="mainGenre" id="baseGenre">
            {options(genre1)}
          </select>
        );
      }
      return (
        <select name="mainGenre" id="baseGenre">
          {options("")}
        </select>
      );
    }
    if (genre2 && genre2.length != 0) {
      return (
        <select name="secondGenre" id="secondGenre">
          {options(genre2)}
        </select>
      );
    }
    return (
      <select name="secondGenre" id="secondGenre">
        {options("")}
      </select>
    );
  }

  return (
    <div className={styles.eventCard}>
      <div className={styles.eventPicture}>
        <input id='eventPicture' name='eventPicture' type="file" onChange={bannerImageChosen} />
        <label htmlFor="eventPicture" className={styles.overlay}>{eventPictureSource.length == 0 ? "Upload image" : "Change image"}</label>
        {showEventPicture()}
      </div>
      <div className={styles.event}>
        <div className={styles.performance}>{title}</div>
        <div className={styles.location}>
          <Image src="/icons/location.png" width={18} height={21} alt="" />
          <div>{location}</div>
        </div>
      </div>
      <div className={styles.tickets}>
        <div className={styles.photo}>
          <Image src="/icons/crowd.png" width={18} height={17} alt="People attending" />
        </div>
        0
      </div>
      <div className={styles.info}>
        <div className={styles.calendar}>
          <div className={styles.photo}>
            <Image src="/icons/date.png" width={38} height={41} alt="Date" />
          </div>
          <div className={styles.dateAndTime}>
            <div className={styles.date}>{convertDate(date)}</div>
            <div className={styles.time}>{time}</div>
          </div>
        </div>
        <div className={styles.price}>
          <div className={styles.photo}>
            <Image src="/icons/price.png" width={20} height={18} alt="Price" />
          </div>
          <div>{price} EUR</div>
        </div>
      </div>
      <div className={styles.tags}>
        <div className={styles.divider}></div>
        <div className={styles.tag}>
          {showSelection("mainGenre")}
        </div>
        <div className={styles.tag}>
          {showSelection("secondGenre")}
        </div>
      </div>
    </div>
  );
}

export default EventCardUpload;
