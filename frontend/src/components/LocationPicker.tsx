import styles from "@/styles/LocationPicker.module.css";
import { ForwardedRef, useEffect, useState } from "react";
import { Venue } from "./BackendTypes";
import { environment } from "./Environment";

// This component can have no selection on initialisation or a default venue.
// The default venue is set by passing the venueID prop. That is why it conditional.
type LocationPickerProps = {
  venueID?: string;
  locationCallback: (venue: Venue) => void;
  forwardedRef?: ForwardedRef<HTMLSelectElement>;
  clear?: boolean;
  clearCallback?: (clear: boolean) => void;
};

// This component is used to select a venue for an event.
// The venue is selected from a list of venues that are fetched from the backend.
// The venue is passed to the surrounding component/page with a callback.
export default function LocationPicker({
  venueID,
  locationCallback,
  forwardedRef,
  clear,
  clearCallback
}: LocationPickerProps) {
  const [venueOptions, setVenueOptions] = useState([]);
  const [defaultVenue, setDefaultVenue] = useState<string | null>(null);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);

  // Fetch the venues from the backend and save them in a useState variable.
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
        const selectedVenue = responseJSON.find((venue: Venue) => venueID && venue.venueID === venueID);
        if (selectedVenue) {
          setDefaultVenue(selectedVenue.venueName);
          setSelectedVenue(selectedVenue);
        }
      });
  }, [venueID]);

  // If a venue is selected, pass it to the surrounding component/page with a callback.
  // This gives a warning on build because the callback is not in the dependency array, but if it would be,
  // there would be an infinite loop.
  useEffect(() => {
    if (selectedVenue) {
      locationCallback(selectedVenue);
    }
  }, [selectedVenue]);

  // If the clear prop is true, clear the selected venue.
  // This gives a warning on build because the callback is not in the dependency array, but if it would be,
  // there would be an infinite loop.
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
