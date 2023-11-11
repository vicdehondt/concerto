import Head from 'next/head'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import type { NextApiRequest, NextApiResponse } from 'next'
import { FormEvent } from 'react'

const inter = Inter({ subsets: ['latin'] })

export default function AddEvent() {

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const response = await fetch('/api/event/retrieve?id=1', {
      method: 'GET',
      // body: formData,
    })

    // Handle response if necessary
    const data = await response.json()
    const imageData = data.image
    console.log(data)
    console.log(imageData)
    // ...
  }

  return (
    <>
      <Head>
        <title>Concerto | Add an event</title>
        <meta name="description" content="Add your event!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <div className={[styles.page, styles.addEventPage].join(" ")}>
        {/* <form action="http://localhost:8080/event/add" method="POST" enctype='multipart/form-data'> */}
        <form onSubmit={onSubmit}>
            {/* <div className={styles.inputGroup}>
                <input type="text" name='title' id='title' required placeholder="Enter the title" />
            </div>
            <div className={styles.inputGroup}>
                <input type="text" name='description' id='description' required placeholder="Enter the description" />
            </div>
            <div className={styles.inputGroup}>
                <input type="text" name='datetime' id='datetime' required placeholder="Enter the date and time" />
            </div>
            <div className={styles.inputGroup}>
                <input type="number" name='maxpeople' id='maxpeople' required placeholder="Enter the maximum amount of people" />
            </div>
            <div className={styles.inputGroup}>
                <input type="number" name='price' id='price' required placeholder="Enter the ticket price" />
            </div>
            <div className={styles.inputGroup}>
                <input type="number" name='eventid' id='eventid' required placeholder="Enter the event id" />
            </div>
            <div className={styles.inputGroup}>
                <input id='image' name='image' type="file" required multiple />
            </div> */}
            <button className={styles.submitButton} type='submit'>Upload</button>
        </form>
        </div>
      </main>
    </>
  )
}
