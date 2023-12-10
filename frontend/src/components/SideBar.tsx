import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "../styles/SideBar.module.css";
import Link from "next/link";
import Searchbar from "./Searchbar";
import { FUNCTIONS_CONFIG_MANIFEST } from "next/dist/shared/lib/constants";
import React, {useState, useEffect} from 'react';

type SideBarProps = {
  type: "event" | "friends";
};

const currentDate = getFormattedDate(new Date());

function getFormattedDate(date: Date) {
  return (
    [date.getFullYear(),
    date.getMonth() + 1, // getMonth starts at 0, so January is 00
    date.getDate()].join("-")
  );
}

function SideBarContent({ type }: SideBarProps) {
  return type == "event" ? (
    <>
      <div className={styles.title}>Filter</div>
      <div className={styles.filters}>
        <div className={styles.locationFilter}>
          <div className={styles.location}>Location</div>
          <Searchbar type="thin" onChange={(event) => console.log("Not implemented yet")}/>
        </div>
        <div className={styles.date}>
          <form>
            Date
            <input className={styles.dateInput} type="date" name="date" id="date" defaultValue={currentDate}></input>
          </form>
        </div>
        <div className={styles.genre}>Genre</div>
      </div>
    </>
  ) : type == "friends" ? (
    <>
      <div className={styles.title}>
        Requests
      </div>
      <div className={styles.requestContainer}></div>
      <div className={styles.title}>
        Add friend
      </div>
      <div className={styles.addFriendContainer}></div>
    </>
  ) : (
    <div>Give right sidebar type</div>
  );
}

function SideBar({ type }: SideBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsOpen(window.innerWidth > 600);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    
    <div className={styles.sidebar}>
      <div className={styles.searchbar}>
        <Searchbar type="thick" onChange={(event) => console.log("Not implemented yet.")} />
      </div>
      <div className={styles.sidebareMenu}>
        <button className={`${styles.filterButton} ${isOpen ? styles.open : ''}`} onClick={() =>  setIsOpen(!isOpen)}>
            Filters
        </button>
      <div className={styles.sidebarDropdown}>
      {isOpen && (
        <div className={styles.dropdownContent} onMouseEnter={() => {setDropdownVisible(true);}} onMouseLeave={() => {setDropdownVisible(false);}}>
          <SideBarContent type={type} />
        </div>
      )}
      </div>
      </div>
    </div>
  );
}

export default SideBar;