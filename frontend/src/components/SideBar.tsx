import styles from "@/styles/SideBar.module.css";
import Searchbar from "./Searchbar";
import { FUNCTIONS_CONFIG_MANIFEST } from "next/dist/shared/lib/constants";
import React, {useState, useEffect} from 'react';
import LocationPicker from "@/components/LocationPicker";
import { Filter, Venue } from "./BackendTypes";
import { useRef} from "react";
import { genreOptions } from "./GenreOptions";

type SideBarProps = {
  type: "event" | "friends";
  filters?: Filter;
  filterCallback?: (filter: Filter) => void;
  searchCallback?: (string: boolean) => void;
  queryCallback?: (query: string) => void;
};

const currentDate = getFormattedDate(new Date());

function getFormattedDate(date: Date) {
  return [
    date.getFullYear(),
    date.getMonth() + 1, // getMonth starts at 0, so January is 00
    date.getDate(),
  ].join("-");
}

function SideBarContent({ type, filters, filterCallback }: SideBarProps) {
  const datePickerRef = useRef<HTMLInputElement>(null);
  const minPriceRangeRef = useRef<HTMLInputElement>(null);
  const maxPriceRangeRef = useRef<HTMLInputElement>(null);
  const locationPickerRef = useRef<HTMLSelectElement>(null);
  const [selectors, setSelectors] = useState<Array<string>>([""]);
  const [minimumPrice, setMinimumPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [clearLocationPicker, setClearLocationPicker] = useState<boolean>(false);

  function setLocation(venue: Venue) {
    filters &&
      filterCallback &&
      filterCallback({
        venueID: venue.venueID,
        date: filters.date,
        genre: filters.genre,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
      });
  }

  function setDate(date: string) {
    const dateObj = new Date(date);
    filters &&
      filterCallback &&
      filterCallback({
        venueID: filters.venueID,
        date: dateObj,
        genre: filters.genre,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
      });
  }

  function setPrice(minPrice: string, maxPrice: string) {
    filters &&
      filterCallback &&
      filterCallback({
        venueID: filters.venueID,
        date: filters.date,
        genre: filters.genre,
        minPrice: minPrice,
        maxPrice: maxPrice,
      });
  }

  function setGenres(genres: Array<string>) {
    const filteredGenres = genres.filter((value, index, self) => {
      return self.indexOf(value) === index && value != "";
    });
    filters &&
      filterCallback &&
      filterCallback({
        venueID: filters.venueID,
        date: filters.date,
        genre: filteredGenres,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
      });
  }

  function clearFilters() {
    if (datePickerRef.current) {
      datePickerRef.current.value = "";
    }
    if (minPriceRangeRef.current) {
      minPriceRangeRef.current.value = "";
    }
    if (maxPriceRangeRef.current) {
      maxPriceRangeRef.current.value = "";
    }
    if (locationPickerRef.current) {
      locationPickerRef.current.value = "Choose venue";
      setClearLocationPicker(true);
    }
    setSelectors([""]);
    filterCallback &&
      filterCallback({ venueID: null, date: null, genre: null, minPrice: null, maxPrice: null });
  }

  function addSelector() {
    setSelectors((selectors) => [...selectors, ""]);
  }

  function removeSelector(index: number) {
    var amount = 0;
    selectors.forEach((value) => {
      if (value == selectors[index]) {
        amount++;
      }
    });
    if (amount == 1) {
      setGenres(selectors.filter((genre: string) => genre !== selectors[index]));
    }
    setSelectors((prevSelectors) => prevSelectors.filter((_, i) => i !== index));
  }

  function showSelectors() {
    return selectors.map((value, index) => {
      const uniqueKey = `selector-${index}-${Date.now()}`;
      return (
        <div className={styles.selectorContainer} key={uniqueKey}>
          <select
            className={styles.genreSelector}
            defaultValue={value}
            onChange={(event) => {
              const newSelectors = [...selectors];
              newSelectors[index] = event.target.value;
              setSelectors(newSelectors);
              setGenres(newSelectors);
            }}
          >
            <option key={1} value="Choose genre" hidden>
              Choose genre
            </option>
            {genreOptions}
          </select>
          {index > 0 && <button onClick={() => removeSelector(index)}>-</button>}
        </div>
      );
    });
  }

  return type == "event" ? (
    <>
      <div className={styles.title}>Filter</div>
      <div className={styles.filters}>
        <div className={styles.locationFilter}>
          <div className={styles.location}>Location</div>
          <LocationPicker
            locationCallback={(venue: Venue) => setLocation(venue)}
            forwardedRef={locationPickerRef}
            clear={clearLocationPicker}
            clearCallback={(clear: boolean) => setClearLocationPicker(clear)}
          />
        </div>
        <div className={styles.date}>
          Date
          <input
            ref={datePickerRef}
            className={styles.dateInput}
            type="date"
            name="date"
            id="date"
            onChange={(event) => setDate(event.target.value)}
          ></input>
        </div>
        <div className={styles.genre}>
          Genre
          <div className={styles.selectors}>
            {showSelectors()}
            <button onClick={addSelector}>+</button>
          </div>
        </div>
        <div className={styles.price}>
          Price
          <div className={styles.priceRange}>
            <input
              ref={minPriceRangeRef}
              type="number"
              placeholder="Min."
              min="0"
              onChange={(event) => {
                const minPrice = event.target.value;
                if (
                  minPrice !== "" &&
                  maxPrice != "" &&
                  (maxPrice as unknown as number) >= (minPrice as unknown as number)
                ) {
                  setPrice(minPrice, maxPrice);
                } else if (minPrice != "" && maxPrice == "") {
                  setPrice(minPrice, "99999");
                }
                setMinimumPrice(event.target.value);
              }}
            />
            <input
              ref={maxPriceRangeRef}
              type="number"
              placeholder="Max."
              min="0"
              onChange={(event) => {
                const maxPrice = event.target.value;
                if (
                  minimumPrice !== "" &&
                  maxPrice != "" &&
                  (maxPrice as unknown as number) >= (minimumPrice as unknown as number)
                ) {
                  setPrice(minimumPrice, maxPrice);
                } else if (minimumPrice == "" && maxPrice != "") {
                  setPrice("0", maxPrice);
                }
                setMaxPrice(event.target.value);
              }}
            />
          </div>
        </div>
      </div>
      <button className={styles.clearFilters} onClick={(event) => clearFilters()}>
        Remove filters
      </button>
    </>
  ) : type == "friends" ? (
    <></>
  ) : (
    <div>Give right sidebar type</div>
  );
}

function SideBar({ type, filters, filterCallback, searchCallback, queryCallback }: SideBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  function search(query: string) {
    searchCallback && searchCallback(query.length > 0);
    queryCallback && queryCallback(query);
  }

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
      <Searchbar
        type="thick"
        onClick={(string) => null}
        onChange={(query) => search(query)}
      />
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
