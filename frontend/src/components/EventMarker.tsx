import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const environment = {
    backendURL: "http://localhost:8080",
};

if (process.env.NODE_ENV == "production") {
  environment.backendURL = "https://api.concerto.dehondt.dev";
}

type Event = {
  eventID: number;
  title: string;
  description: string;
  checkedIn: number;
  dateAndTime: string;
  price: number;
  eventPicture: string;
  venueID: string;
  artistID: string;
};

export default function EventMarker({event}: {event: Event}) {
    const [loggedIn, setLoggedIn] = useState(false);

    function redirectURL(normalURL: string) {
        if (loggedIn) {
        return normalURL;
        }
        return `/login?from=${encodeURIComponent(normalURL)}`
    }

    useEffect(() => {
        fetch(environment.backendURL + "/auth/status", {
        mode: "cors",
        credentials: "include",
        })
        .then((response) => {
            if (response.status == 200) {
            setLoggedIn(true)
            } else if (response.status == 400) {
            setLoggedIn(false)
            }
        });
    }, []);

    return (
    <div>
        <div>
            {event.title}
        </div>
        <div>
            <Image src={event.eventPicture} width={50} height={50} alt="Picture of the event"/>
        </div>
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0B2027', borderRadius: '5px', width: 90}}>
            <Link style={{color: 'white'}} href={redirectURL(`/concerts/${event.eventID}`)}> Go to event </Link>
        </div>
    </div>
    )
}