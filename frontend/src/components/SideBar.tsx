import styles from "@/styles/SideBar.module.css";
import Searchbar from "./Searchbar";
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

  return (
    <div className={styles.sidebar}>
      <Searchbar type="thick" onClick={(string) => console.log("Not implemented yet.", string)} onChange={(string) => console.log("Not implemented yet.", string)} />
      <SideBarContent type={type} filters={filters} filterCallback={(filter: Filter) => filterCallback && filterCallback(filter)} />
    </div>
  );
}

export default SideBar;