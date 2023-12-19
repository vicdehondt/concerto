import styles from "@/styles/LocationPicker.module.css";
import { ForwardedRef, useEffect, useState } from "react";
import { Venue } from "./BackendTypes";
import { environment } from "./Environment";

type LocationPickerProps = {
  venueID?: string;
  locationCallback: (venue: Venue) => void;
  forwardedRef?: ForwardedRef<HTMLSelectElement>;
  clear?: boolean;
  clearCallback?: (clear: boolean) => void;
};

export default function LocationPicker({
  venueID,
  locationCallback,
  forwardedRef,
  clear,
  clearCallback
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
  }, [venueID]);

  useEffect(() => {
    if (selectedVenue) {
      locationCallback(selectedVenue);
    }
  }, [selectedVenue]);

  useEffect(() => {
    if (clear && clearCallback) {
      setSelectedVenue(null);
      clearCallback(false);
    }

  }, [clear]);

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
        value={selectedVenue?.venueName || "Choose venue"}
        onChange={(event) => {
          const selectedOption =
            event.target.options[event.target.selectedIndex].getAttribute("data-venue");
          const selectedVenue =
            selectedOption != null
              ? JSON.parse(selectedOption)
              : { venueID: "123", venueName: "Not selected" };
          setSelectedVenue(selectedVenue);
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
