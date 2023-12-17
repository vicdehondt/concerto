import styles from "@/styles/LocationPicker.module.css";
import { ForwardedRef, useEffect, useState } from "react";
import { Venue } from "./BackendTypes";
import { environment } from "./Environment";

type LocationPickerProps = {
  venueID?: string;
  locationCallback: (venue: Venue) => void;
  forwardedRef?: ForwardedRef<HTMLSelectElement>;
};

export default function LocationPicker({
  venueID,
  locationCallback,
  forwardedRef,
}: LocationPickerProps) {
  const [venueOptions, setVenueOptions] = useState([]);
  const [defaultVenue, setDefaultVenue] = useState<string | null>(null);

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
        responseJSON.forEach((venue: Venue) => {
          if (venueID && venue.venueID == venueID) {
            setDefaultVenue(venue.venueName);
            locationCallback(venue);
          }
        });
      });
  }, []);

  function showVenueOptions() {
    return venueOptions.map((venue: Venue) => (
      <option key={venue.venueID} value={venue.venueName} data-venue={JSON.stringify(venue)}>
        {venue.venueName}
      </option>
    ));
  }

  return (
    <div className={styles.locationPicker}>
      <select
        id="venue"
        required
        ref={forwardedRef}
        value={defaultVenue || "Choose venue"}
        onChange={(event) => {
          const selectedOption =
            event.target.options[event.target.selectedIndex].getAttribute("data-venue");
          const selectedVenue =
            selectedOption != null
              ? JSON.parse(selectedOption)
              : { venueID: "123", venueName: "Not selected" };
          locationCallback(selectedVenue);
          setDefaultVenue(selectedVenue.venueName);
        }}
      >
        {!defaultVenue && (
          <option key="1" value="Choose venue" hidden>
            Choose venue
          </option>
        )}
        {showVenueOptions()}
      </select>
    </div>
  );
}
