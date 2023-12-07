import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";

const inter = Inter({ subsets: ["latin"] });

const environment = {
  backendURL: "http://localhost:8080",
};
if (process.env.NODE_ENV == "production") {
  environment.backendURL = "https://api.concerto.dehondt.dev";
}

export default function Venue() {

  return (
    <>
      <Head>
        <title>Concerto | Rate {"blablabla"}</title>
        <meta name="description" content={`Rate the venue! Rate ${"Blablabla"}`} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <div className={[styles.page, styles.venuePage].join(" ")}>
        </div>
      </main>
    </>
  );
}