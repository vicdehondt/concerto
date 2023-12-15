import styles from "@/styles/LocationPicker.module.css";
import { ForwardedRef, useEffect, useState } from "react";
import { Venue } from "./BackendTypes";
import { environment } from "./Environment";

type LocationPickerProps = {
  venueID?: string;
  locationCallback: (venue: Venue) => void;
  forwardedRef?: ForwardedRef<HTMLSelectElement>;
};

export default function LocationPicker({ venueID, locationCallback, forwardedRef }: LocationPickerProps) {
  const [venueOptions, setVenueOptions] = useState([]);
  const [defaultVenue, setDefaultVenue] = useState<Venue | null>(null);

  useEffect(() => {
    fetch(environment.backendURL + "/venues", {
      mode: "cors",
      credentials: "include",
    })
      .then((response) => {
        return response.json();
      })
      .then((responseJSON) => {
        setVenueOptions(responseJSON);
      });
  }, []);

  useEffect(() => {
    venueOptions.forEach((venue: Venue) => {
      if (venueID && venue.venueID == venueID) {
        setDefaultVenue(venue);
        locationCallback(venue);
      }
    })
  }, [venueID, venueOptions, locationCallback]);

  function showVenueOptions() {
    return venueOptions.map((venue: Venue) => {
      if (defaultVenue && venue.venueID == defaultVenue.venueID) {
        return (
          <option id={venue.venueID} key={venue.venueID} value={venue.venueName} data-venue={JSON.stringify(venue)} selected>
            {venue.venueName}
          </option>
        );
      }
      return (
        <option id={venue.venueID} key={venue.venueID} value={venue.venueName} data-venue={JSON.stringify(venue)}>
          {venue.venueName}
        </option>
      );
    });
  }

  return (
    <div className={styles.locationPicker}>
      <select
        name="venue"
        id="venue"
        ref={forwardedRef}
        onChange={(event) => {
          const selectedOption =
            event.target.options[event.target.selectedIndex].getAttribute("data-venue");
          const selectedVenue =
            selectedOption != null
              ? JSON.parse(selectedOption)
              : { venueID: "123", venueName: "Not selected" };
          locationCallback(selectedVenue);
        }}
      >
        {defaultVenue ? null : (
          <option key="1" value="" hidden defaultValue="Choose venue">
            Choose venue
          </option>
        )}
        {showVenueOptions()}
      </select>
    </div>
  );
}
