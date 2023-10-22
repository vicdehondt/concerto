import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Biography from "@/components/Biography";

const inter = Inter({ subsets: ["latin"] });

//few notes:
//in jsx you van only use html or react components
//<> = telling react to use a fragment so that we can let it return more than one item

export default function Account() {
  return (
    <> 
      <Head>
        <title>Concerto | Account</title>
        <meta name="description" content="Your Account." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <div className={styles.gridContainer}>
          <Navbar />
            {/* <div className={styles.biographyContainer}> */}
            <Biography source="/photos/ariana.jpeg" username="Ariana"/>
            {/* </div> */}
        </div>
      </main>
    </>
  );
}
