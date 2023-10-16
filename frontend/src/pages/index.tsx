import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <>
      <Head>
        <title>Login</title>
        <meta name="description" content="Login to your account!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <div className={styles.gridContainer}>
          <div className={styles.navbar}>
            <div className={styles.leftTopics}>
              <Link href="/">Concerto</Link>
              <div className={styles.search}>
                <div className={styles.searchContainer}>
                  <div className={styles.searchBar}>
                    Search...
                  </div>
                </div>
              </div>
              <div className={styles.addEvent}>
                <a>+</a>
              </div>
            </div>
            <div className={styles.rightTopics}>
              <a>Friends</a>
              <a>Wishlist</a>
              <a>Notifications</a>
              <a>Account</a>
            </div>
          </div>
          <div className={styles.sidebar}>
            <div className={styles.search}>
              <div className={styles.searchContainer}>
                <div className={styles.searchBar}>
                  Search events...
                </div>
              </div>
            </div>
            <div className={styles.filterTitle}>
              Filter
            </div>
            <div className={styles.filters}>
              <div className={styles.locationFilter}>
                <div className={styles.location}>
                  Location
                </div>
                <div className={styles.search}>
                  <div className={styles.searchContainer}>
                    <div className={styles.searchBar}>
                      Search...
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.date}>
                Date
              </div>
              <div className={styles.genre}>
                Genre
              </div>
            </div>
          </div>
          <div className={styles.pageContent}>
            <div className={styles.title}>
            <h1>Events this week you may like</h1>
            </div>
            <div className={styles.eventCardContainer}>
              <div className={styles.eventCard}>
                <div className={styles.photo}>
                  <Image src="/photos/ariana.jpeg" width={120} height={120} alt='Performer'/>
                </div>
                <div className={styles.event}>
                  <div className={styles.performance}>Ariana Grande</div>
                  <div className={styles.location}>
                    <Image src="/icons/location.png" width={18} height={21} alt=''/>
                    <div>Lotto Arena</div>
                  </div>
                </div>
                <div className={styles.tickets}>
                  <div className={styles.photo}>
                    <Image src="/icons/crowd.png" width={18} height={17} alt='People attending'/>
                  </div>
                  <div>560</div>
                </div>
                <div className={styles.info}>
                  <div className={styles.calendar}>
                    <div className={styles.photo}>
                      <Image src="/icons/date.png" width={38} height={41} alt='Date'/>
                    </div>
                    <div className={styles.dateAndTime}>
                      <div className={styles.date}>9 oktober 2023</div>
                      <div className={styles.time}>18:00 &ndash; 22:00</div>
                    </div>
                  </div>
                  <div className={styles.price}>
                    <div className={styles.photo}>
                      <Image src="/icons/price.png" width={20} height={18} alt='Price'/>
                    </div>
                    <div>100 &ndash; 200 EUR</div>
                  </div>
                </div>
                <div className={styles.wishlist}>
                  <Image src="/icons/heart.png" width={28} height={28} alt='Add to wishlist'/>
                </div>
                <div className={styles.tags}>
                  <div className={styles.divider}></div>
                  <div className={styles.tag}>
                    Pop
                  </div>
                  <div className={styles.tag}>
                    Alternative
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
