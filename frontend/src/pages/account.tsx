import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import Biography from "@/components/Biography";

const inter = Inter({ subsets: ["latin"] });

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
        <div className={[styles.page, styles.accountPage].join(" ")}>
          {/* <div className={styles.biographyContainer}> */}
          <Biography source="/photos/ariana.jpeg" username="Ariana" />
          {/* </div> */}
        </div>
      </main>
    </>
  );
}
