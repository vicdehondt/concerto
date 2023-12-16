import styles from "@/styles/SideBar.module.css";
import Searchbar from "./Searchbar";
import { FUNCTIONS_CONFIG_MANIFEST } from "next/dist/shared/lib/constants";
import React, {useState, useEffect} from 'react';
import LocationPicker from "@/components/LocationPicker";
import { Filter, Venue } from "./BackendTypes";
import { useRef } from "react";

type SideBarProps = {
  type: "event" | "friends";
  filters?: Filter;
  filterCallback?: (filter: Filter) => void;
};

const currentDate = getFormattedDate(new Date());

function getFormattedDate(date: Date) {
  return (
    [date.getFullYear(),
    date.getMonth() + 1, // getMonth starts at 0, so January is 00
    date.getDate()].join("-")
  );
}

function SideBarContent({ type, filters, filterCallback }: SideBarProps) {

  const datePickerRef = useRef<HTMLInputElement>(null);
  const priceRangeRef = useRef<HTMLInputElement>(null);
  const locationPickerRef = useRef<HTMLSelectElement>(null);

  function setLocation(venue: Venue) {
    filters && filterCallback && filterCallback({venueID: venue.venueID, datetime: filters.datetime, genre1: filters.genre1, price: filters.price});
  }

  function clearFilters() {
    if (datePickerRef.current) {
      datePickerRef.current.value = "";
    }
    if (priceRangeRef.current) {
      priceRangeRef.current.value = "";
    }
    if (locationPickerRef.current) {
      locationPickerRef.current.value = "";
    }
  }

  return type == "event" ? (
    <>
      <div className={styles.title}>Filter</div>
      <div className={styles.filters}>
        <div className={styles.locationFilter}>
          <div className={styles.location}>Location</div>
          <LocationPicker locationCallback={(venue: Venue) => setLocation(venue)} forwardedRef={locationPickerRef} />
        </div>
        <div className={styles.date}>
          Date
          <input ref={datePickerRef} className={styles.dateInput} type="date" name="date" id="date"></input>
        </div>
        <div className={styles.genre}>
          Genre
          {/* <select name="genre1">
          </select>
          <select name="genre2">
          </select> */}
        </div>
        <div className={styles.price}>
          Price
          <input ref={priceRangeRef} type="number" placeholder="Minimum price" min="0" />
          </div>
      </div>
      <button className={styles.clearFilters} onClick={(event) =>clearFilters()}>Remove filters</button>
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

function SideBar({ type, filters, filterCallback }: SideBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      // Use requestAnimationFrame for smoother performance
      requestAnimationFrame(() => {
        setIsOpen(window.innerWidth > 600);
      });
    };

    // Initial check
    handleResize();

    // Add event listener for window resize
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    
    <div className={styles.sidebar}>
      <div className={styles.searchbar}>
      <Searchbar type="thick" onClick={(string) => console.log("Not implemented yet.", string)} onChange={(string) => console.log("Not implemented yet.", string)} />
      </div>
      <div className={styles.sidebareMenu}>
        <button className={`${styles.filterButton} ${isOpen ? styles.open : ''}`} onClick={() =>  setIsOpen(!isOpen)}>
            Filters
        </button>
      <div className={styles.sidebarDropdown}>
      {isOpen && (
        <div className={styles.dropdownContent} onMouseEnter={() => {setDropdownVisible(true);}} onMouseLeave={() => {setDropdownVisible(false);}}>
           <SideBarContent type={type} filters={filters} filterCallback={(filter: Filter) => filterCallback && filterCallback(filter)} />
        </div>
      )}
      </div>
      </div>
    </div>
  );
}

export default SideBar;