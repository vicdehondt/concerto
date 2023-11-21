import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/EventCardUpload.module.css";
import Tag from "@/components/Tag";
import Link from "next/link";
import { ChangeEvent, useState } from "react";

function handleAddToWishlist() {
  console.log("Need to access back-end for this one!");
}

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

function EventCardUpload({ title, location, date, time, price, image }:
  { title: string, location: string, date: string, time: string, price: number, image: string }) {

  // const convertedDateAndTime: Array<string> = convertDateAndTime(dateAndTime);
  // const date = convertedDateAndTime[0]
  // const time = convertedDateAndTime[1]

  function convertDate(date: string) {
    const convertedDate = new Date(date);
    const year = convertedDate.getFullYear();
    const month = getMonth(convertedDate.getMonth());
    const day = convertedDate.getDate();
    // const date = [[month, day].join(" "), year].join(", ");

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

  return (
    <div className={styles.eventCard}>
      <div className={styles.eventPicture}>
        <input id='eventPicture' name='eventPicture' type="file" required onChange={bannerImageChosen} />
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
            {/* <div className={styles.time}>18:00 &ndash; 22:00</div> */}
            <div className={styles.time}>{time}</div>
          </div>
        </div>
        <div className={styles.price}>
          <div className={styles.photo}>
            <Image src="/icons/price.png" width={20} height={18} alt="Price" />
          </div>
          {/* <div>100 &ndash; 200 EUR</div> */}
          <div>{price} EUR</div>
        </div>
      </div>
      <div className={styles.addToWishlist} onClick={handleAddToWishlist}>
        <Image src="/icons/heart.png" width={28} height={28} alt="Add to wishlist" />
      </div>
      <div className={styles.tags}>
        <div className={styles.divider}></div>
        <Tag text="Pop" />
        <Tag text="Alternative" />
      </div>
    </div>
  );
}

export default EventCardUpload;
