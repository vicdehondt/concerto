import Image from "next/image";
import styles from "@/styles/EventCardUpload.module.css";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { genreOptions } from "./GenreOptions";

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
  edit?: boolean;
};

function EventCardUpload({
  title,
  location,
  date,
  time,
  price,
  image,
  genre1,
  genre2,
  edit,
}: EventCardUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      return (
        <Image
          src={eventPictureSource}
          style={{ objectFit: "cover" }}
          width={120}
          height={120}
          alt="Performer"
        />
      );
    }
  }

  function options(genre: string) {
    const chooseOption = (
      <option key={"choose"} id="choose" hidden value="">
        Choose genre
      </option>
    );
    const selectedValue = genre || "";
    return [
      chooseOption,
      ...genreOptions.map((option) => (
        <option key={option.props.id} id={option.props.id} value={option.props.value}>
          {option.props.value}
        </option>
      )),
    ];
  }

  function showSelection(name: string) {
    const selectedGenre = name === "mainGenre" ? genre1 : genre2;
    const validSelectedGenre = selectedGenre || "";

    return (
      <select
        required
        name={name}
        id={name === "mainGenre" ? "baseGenre" : "secondGenre"}
        defaultValue={validSelectedGenre}
      >
        {options(validSelectedGenre)}
      </select>
    );
  }

  return (
    <div className={styles.eventCard}>
      <div className={styles.eventPicture}>
        {edit ? (
          <input
            ref={fileInputRef}
            id="eventPicture"
            name="eventPicture"
            type="file"
            accept="image/png, image/jpg, image/jpeg"
            onChange={bannerImageChosen}
          />
        ) : (
          <input
            ref={fileInputRef}
            required
            id="eventPicture"
            name="eventPicture"
            type="file"
            accept="image/png, image/jpg, image/jpeg"
            onChange={bannerImageChosen}
          />
        )}
        <div
          className={styles.overlay}
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
        >
          {eventPictureSource.length == 0 ? "Upload image" : "Change image"}
        </div>
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
        <div className={styles.tag}>{showSelection("mainGenre")}</div>
        <div className={styles.tag}>{showSelection("secondGenre")}</div>
      </div>
    </div>
  );
}

export default EventCardUpload;
