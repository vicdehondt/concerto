import Head from 'next/head'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import type { NextApiRequest, NextApiResponse } from 'next'
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react'
import { useRouter } from "next/router";

const inter = Inter({ subsets: ['latin'] })

const environment = {
  backendURL: "http://localhost:8080"
}
if (process.env.NODE_ENV == "production") {
  environment.backendURL = "https://api.concerto.dehondt.dev"
}

export default function Register() {
  const router = useRouter();
  const[error, setError] = useState("");
  const [isLengthValid, setIsLengthValid] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [arePasswordsEqual, setArePasswordsEqual] = useState(false);

  function goToLogin() {
    const from = router.query.from || '/';
    router.push(`/login?from=${from}`);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {

    event.preventDefault();
    var formData = new FormData(event.currentTarget);
    const form_values = Object.fromEntries(formData);
    const response = await fetch(environment.backendURL + "/register", {
      method: 'POST',
      body: formData,
      mode: 'cors',
      credentials: 'include',
    })

    // Handle response if necessary
    const data = await response.json()
    if (response.status == 200) {
      goToLogin();
    } else if (response.status == 400) {
      setError(data.errors)
    }
    // ...
  }

  function checkPasswordValidation(event: ChangeEvent<HTMLInputElement>) {
    const inputValue = event.target.value;
    const isLengthValid = inputValue.length >= 6;
    const isPasswordValid = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/.test(inputValue);
    setIsLengthValid(isLengthValid);
    setIsPasswordValid(isPasswordValid);
  }

  function checkPasswordEquality(event: ChangeEvent<HTMLInputElement>) {
    const password = event.target.form.password.value;
    const verifyPassword = event.target.value;
    setArePasswordsEqual(password === verifyPassword);
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
        <div className={[styles.page, styles.registerPage].join(" ")}>
          <form onSubmit={onSubmit} className={styles.registerForm}>
            <h1>Register</h1>
            { error ? <h4 className={styles.inputError}>{error}</h4> : null }
            <input className={[styles.registerInput, styles.usernameInput].join(" ")} type="text" name='username' id='username' required placeholder="Username" />
            <input className={[styles.registerInput, styles.emailInput].join(" ")} type="email" name='mail' id='mail' required placeholder="E-mail address" />
            <input className={[styles.registerInput, styles.passwordInput].join(" ")} type="password" name='password' id='password' required placeholder="Password" pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}" onChange={(event) => {
              checkPasswordValidation(event);
            }} />
            <input className={[styles.registerInput, styles.passwordInput].join(" ")} type="password" name='verifyPassword' id='verifyPassword' required placeholder="Verify password" onChange={(event) => checkPasswordEquality(event)} />
            <div className={styles.validationMessages}>
            <div className={`${styles.validationMessage} ${isLengthValid ? styles.valid : styles.invalid}`}>
              The password must contain at least 6 characters.
            </div>
            <div className={`${styles.validationMessage} ${isPasswordValid ? styles.valid : styles.invalid}`}>
              The password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number.
            </div>
            <div className={`${styles.validationMessage} ${arePasswordsEqual ? styles.valid : styles.invalid}`}>
              Fill in the same password twice.
            </div>
            </div>
            <button className={[styles.registerInput, styles.submitButton].join(" ")} type='submit'>Submit</button>
          </form>
        </div>
      </main>
    </>
  )
}