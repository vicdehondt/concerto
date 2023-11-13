import Head from 'next/head'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import type { NextApiRequest, NextApiResponse } from 'next'
import { FormEvent } from 'react'

const inter = Inter({ subsets: ['latin'] })



export default function Login() {
  async function onSubmit(event: FormEvent<HTMLFormElement>) {

    event.preventDefault();
    var formData = new FormData(event.target);
    const form_values = Object.fromEntries(formData);
    console.log('form values', form_values)
    const response = await fetch("http://localhost:8080/register", {
      method: 'POST',
      body: formData,
    })

    // Handle response if necessary
    const data = await response.json()
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
            <div className={styles.inputGroup}>
                <input type="text" name='username' id='username' required placeholder="Username" />
            </div>
            <div className={styles.inputGroup}>
                <input type="password" name='password' id='password' required placeholder="Password" />
            </div>
            <div className={styles.inputGroup}>
                <input type="email" name='mail' id='mail' required placeholder="E-mail address" />
            </div>
            <div className={styles.inputGroup}>
                <input id='image' name='image' type="file" required multiple />
            </div>
            <button className={styles.submitButton} type='submit'>Submit</button>
        </form>
        </div>
      </main>
    </>
  )
}