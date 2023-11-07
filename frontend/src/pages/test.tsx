import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import SideBar from "../components/SideBar";
import FriendCard from "../components/FriendCard";
import { useState } from "react";

const inter = Inter({ subsets: ["latin"] });

function Component() {
    const [receivedData, setReceivedData] = useState(null);
    const handleClick = () => {
        fetch('http://localhost:8080/event/retrieve?id=2')
          .then((response) => response.json())
          .then((data) => {
            // Step 3: Update the state with the received data
            setReceivedData(data);
            return (
                {receivedData}
            )
          })
          .catch((error) => {
            console.error('Error fetching data:', error);
          });
      };
      return (
        <div>
          <button onClick={handleClick}>Send GET Request</button>
            <div>
              {/* Access and render the received data here */}
              lol
            </div>
        </div>
      );
}

export default function Friends() {
  return (
    <>
      <Head>
        <title>Concerto | Friends</title>
        <meta name="description" content="Your friends." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <Component>
        </Component>
      </main>
    </>
  );
}
