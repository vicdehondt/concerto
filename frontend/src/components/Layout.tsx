// import "./globals.css";
import NavBar from "@/components/Navbar";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";

const inter = Inter({ subsets: ["latin"] });

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.page}>
      <NavBar pictureSource="/photos/Rombout.jpeg"/>
      {children}
    </div>
  );
}