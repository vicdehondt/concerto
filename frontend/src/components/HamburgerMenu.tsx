import styles from "@/styles/Hamburger.module.css";
import Image from "next/image";
import React, {useState, useEffect} from 'react';
import Searchbar from "./Searchbar";
import Link from "next/link";
import { useRouter } from "next/router";
import { X, User } from 'lucide-react';

type Profile = {
    image: string;
    username: string;
    userID: number;
    mail: string;
    privacyAttendedEvents: string;
    privacyCheckedInEvents: string;
    privacyFriends: string;
  }

const HamburgerMenu = ({pictureSource}: {pictureSource: string}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [loggedIn, setLoggedIn] = useState(true);
    const [profile, setProfile] = useState({userID: 0, image: null});

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    function redirectURL(normalURL: string) {
        return normalURL;
    }

    function showAccountImage() {
        if (profile.userID == 0) {
          return (
            <button className={styles.loginButton} onClick={(event) => router.push(redirectURL("/"))}>Log In</button>
          );
        } else if (profile.image == null) {
          return (
            <Link href={redirectURL("/account")}>
              <User className={styles.userImage} width={40} height={40} />
            </Link>
          );
        } else {
          return (
            <Link href={redirectURL("/account")}>
              <Image src={pictureSource} width={56} height={56} alt="Profile picture"/>
            </Link>
          );
        }
    }

    const toggleHamburgerMenu = () => {
        setIsOpen(!isOpen);
      };

    return (
        <div className={styles.hamburgerMenu}>
            <div className={styles.hamburgerDropdown}>
                <div className={`${styles.button} ${isOpen ? styles.open : ''}`} onClick={() => toggleHamburgerMenu()}>
                    <div className={styles.bar}></div>
                    <div className={styles.bar}></div>
                    <div className={styles.bar}></div>
                </div>
                    {isOpen && (
                        <div className={styles.dropdownContent} onMouseEnter={() => {setDropdownVisible(true);}} onMouseLeave={() => {setDropdownVisible(false);}}>
                            <Link href="/">Concerto</Link>
                            <Searchbar type="long" />
                            <Link href={redirectURL("/add-event")}>Add Event</Link>
                            <Link href={redirectURL("/friends")}>Friends</Link>
                            <Link href={redirectURL("/wishlist")}>Wishlist</Link>
                            <Link href="/settings">Settings</Link>
                        </div>
                    )}
            </div>
            <div className={styles.profilePicture}>
                {showAccountImage()}
            </div>
        </div>

    );
};

export default HamburgerMenu;