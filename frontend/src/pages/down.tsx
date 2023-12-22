import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import SideBar from "@/components/SideBar";

const inter = Inter({ subsets: ["latin"] });

export default function Down() {

  return (
    <>
      <Head>
        <title>Concerto | Connection error</title>
        <meta name="description" content="There is a problem with our systems." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <div className={[styles.page, styles.downPage].join(" ")}>
          <h1>There is a problem with our systems.</h1>
          <h2>We are sorry for the inconvenience.</h2>
          <p>Please try again later.</p>
        </div>
      </main>
    </>
  );
}
