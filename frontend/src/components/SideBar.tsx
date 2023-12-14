import styles from "@/styles/SideBar.module.css";
import Searchbar from "./Searchbar";
import LocationPicker from "@/components/LocationPicker";
import { Filter, Venue } from "./BackendTypes";

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

  function setLocation(venue: Venue) {
    filters && filterCallback && filterCallback({venueID: venue.venueID, datetime: filters.datetime, genre1: filters.genre1});
  }

  return type == "event" ? (
    <>
      <div className={styles.title}>Filter</div>
      <div className={styles.filters}>
        <div className={styles.locationFilter}>
          <div className={styles.location}>Location</div>
          <LocationPicker locationCallback={(venue: Venue) => setLocation(venue)} />
        </div>
        <div className={styles.date}>
          <form>
            Date
            <input className={styles.dateInput} type="date" name="date" id="date"></input>
          </form>
        </div>
        <div className={styles.genre}>Genre</div>
      </div>
      <button>Remove filters</button>
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
      <Searchbar type="thick" onChange={(event) => console.log("Not implemented yet.")} />
      <SideBarContent type={type} filters={filters} filterCallback={(filter: Filter) => filterCallback && filterCallback(filter)} />
    </div>
  );
}

export default SideBar;