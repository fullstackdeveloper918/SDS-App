import { Form, json, redirect } from '@remix-run/react'
import axios from 'axios'
import styles from '../styles/style.module.css'
import React, { useState } from 'react'

export async function loader ({request}) {
  return "get request"
}

export async function action({ request }) {
  const formData = await request.formData();
  const email = formData.get('email');
  const password = formData.get('password');

  try {

    const formDataToSend = new FormData();
    formDataToSend.append('username', email); 
    formDataToSend.append('password', password);

    const response = await axios.post(
      'https://discovery.sdsmanager.com/auth/token/',
      formDataToSend,
      {
        headers: {
          'Content-Type': 'multipart/form-data',  
        },
      }
    );
    
    return redirect('/app');
  } catch (err) {
    console.error('Error while requesting token:', err);

    return redirect('/app/login');
  }
}


const Login = () => {
  const [values, setValues] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: value
    }));
  }

  return (
    <div className={styles.formWrapper}>
      <h2>Login</h2>
      <Form method='POST' className={styles.form}>
        <div className={styles.form_control}>
          <input
            type="email"
            name="email"
            value={values.email}
            onChange={handleChange}
          />
          <label htmlFor="">Email</label>
        </div>
        <div className={styles.form_control}>
          <input
            type="password"
            name="password"
            value={values.password}
            onChange={handleChange}
          />
          <label htmlFor="">Password</label>
        </div>
        <button type='submit'>Login</button>
      </Form>
    </div>
  );
}

export default Login;
