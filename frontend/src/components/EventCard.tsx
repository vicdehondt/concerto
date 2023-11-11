import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/EventCard.module.css";
import Tag from "@/components/Tag";
import Link from "next/link";

function handleAddToWishlist() {
  console.log("Need to access back-end for this one!");
}

function EventCard({ title }: { title: string }) {

  return (
    <div className={styles.eventCard}>
      <div className={styles.photo}>
        <Image src="/photos/ariana.jpeg" width={120} height={120} alt="Performer" />
      </div>
      <div className={styles.event}>
        <Link href={`/concerts/${title}`} className={styles.performance}>{title}</Link>
        <div className={styles.location}>
          <Image src="/icons/location.png" width={18} height={21} alt="" />
          <div>Lotto Arena</div>
        </div>
      </div>
      <div className={styles.tickets}>
        <div className={styles.photo}>
          <Image src="/icons/crowd.png" width={18} height={17} alt="People attending" />
        </div>
        <div>560</div>
      </div>
      <div className={styles.info}>
        <div className={styles.calendar}>
          <div className={styles.photo}>
            <Image src="/icons/date.png" width={38} height={41} alt="Date" />
          </div>
          <div className={styles.dateAndTime}>
            <div className={styles.date}>9 oktober 2023</div>
            <div className={styles.time}>18:00 &ndash; 22:00</div>
          </div>
        </div>
        <div className={styles.price}>
          <div className={styles.photo}>
            <Image src="/icons/price.png" width={20} height={18} alt="Price" />
          </div>
          <div>100 &ndash; 200 EUR</div>
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

export default EventCard;
