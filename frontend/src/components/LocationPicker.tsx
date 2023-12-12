import { useEffect, useState } from "react";

const environment = {
  backendURL: "http://localhost:8080",
};
if (process.env.NODE_ENV == "production") {
  environment.backendURL = "https://api.concerto.dehondt.dev";
}

type Venue = {
  venueID: string;
  venueName: string;
  longitude: number;
  latitude: number;
  ratingID: number;
};

export default function LocationPicker({ locationCallback }: { locationCallback: (venue: Venue) => void }) {
  const [venueOptions, setVenueOptions] = useState([]);

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

  function showVenueOptions() {
    return venueOptions.map((venue: Venue) => {
      return (
        <option key={venue.venueID} value={venue.venueName} data-venue={JSON.stringify(venue)}>
          {venue.venueName}
        </option>
      );
    });
  }

  return (
    <>
      <select
        name="venue"
        id="venue"
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
        <option key="1" value="" hidden defaultValue="Choose venue">
          Choose venue
        </option>
        {showVenueOptions()}
      </select>
    </>
  );
}
