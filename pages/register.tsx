import Head from 'next/head'
import Layout_login from '../layout_login/layout_login'
import Link from 'next/link'
import styles from '../styles/Form.module.css';
import Image from 'next/image'
import { HiAtSymbol, HiFingerPrint, HiOutlineUser } from "react-icons/hi";
import { useState } from 'react';
import { useFormik } from 'formik';
import { registerValidate } from '../lib/validate'
import { useRouter } from 'next/router';
import Layout from "../components/layout"
import {dietPreferences} from "../lib/dietPreference"

export default function Register(){

    interface FormValues {
        username: string;
        email: string;
        dietPreference: string;
        password: string;
        cpassword: string
    }

    const initialValues: FormValues = {
        username : '',
        email: '',
        dietPreference: '',
        password: '',
        cpassword: ''
    }

    const [show, setShow] = useState({ password: false, cpassword: false })
    const router = useRouter()
    const formik = useFormik({
        initialValues: initialValues,
        validate: registerValidate,
        onSubmit
    })

    async function onSubmit(values: FormValues){
        const options = {
            method: "POST",
            headers : { 'Content-Type': 'application/json'},
            body: JSON.stringify(values)
        }

        await fetch('/api/examples/register', options)
            .then(res => res.json())
            .then((data) => {
                console.log(data)
                alert(data.message)
                //if(data) router.push('http://localhost:3000')
            })
    }

    return (
        
        <Layout>

            <Layout_login>

            <Head>
                <title>Register</title>
            </Head>

            <section className='w-3/4 mx-auto flex flex-col gap-10'>
                <div className="title">
                    <h1 className='text-gray-800 text-4xl font-bold py-4'>Register</h1>
                    <p className='w-3/4 mx-auto text-gray-400'>Description text goes here.</p>
                </div>

                {/* form */}
                <form className='flex flex-col gap-5' onSubmit={formik.handleSubmit}>
                    <div className={`${styles.input_group} ${formik.errors.username && formik.touched.username ? 'border-rose-600' : ''}`}>
                        <input 
                        type="text"
                        name='Username'
                        placeholder='Username'
                        className={styles.input_text}
                        {...formik.getFieldProps('username')}
                        />
                        <span className='icon flex items-center px-4'>
                            <HiOutlineUser size={25} />
                        </span>
                    </div>
                    
                    {formik.errors.username && formik.touched.username ? <span className='text-rose-500'>{formik.errors.username}</span> : <></>}
                    {/* {formik.errors.username && formik.touched.username ? <span className='text-rose-500'>{formik.errors.username}</span> : <></>} */}
                    
                    <div className={`${styles.input_group} ${formik.errors.email && formik.touched.email ? 'border-rose-600' : ''}`}>
                        <input 
                        type="email"
                        name='email'
                        placeholder='Email'
                        className={styles.input_text}
                        {...formik.getFieldProps('email')}
                        />
                        <span className='icon flex items-center px-4'>
                            <HiAtSymbol size={25} />
                        </span>
                    </div>
                    {/* {formik.errors.email && formik.touched.email ? <span className='text-rose-500'>{formik.errors.email}</span> : <></>} */}
                    

                    <div className={`${styles.input_group} ${formik.values.dietPreference == '' && formik.touched.username ? 'border-rose-600' : ''}`}>
                        <select name="dietPreference" value={formik.values.dietPreference} className={styles.input_text} {...formik.getFieldProps('dietPreference')}>
                            {<option value="" disabled={true}>Please Choose a diet plan</option>}
                            {dietPreferences.map((diet) => <option key={diet} value={diet}>{diet}</option>)}
                        </select>
                    </div>  

                    <div className={`${styles.input_group} ${formik.errors.password && formik.touched.password ? 'border-rose-600' : ''}`}>
                        <input 
                        type={`${show.password ? "text" : "password"}`}
                        name='password'
                        placeholder='password'
                        className={styles.input_text}
                        {...formik.getFieldProps('password')}
                        />
                        <span className='icon flex items-center px-4' onClick={() => setShow({ ...show, password: !show.password})}>
                            <HiFingerPrint size={25} />
                        </span>
                    </div>
                    {/* {formik.errors.password && formik.touched.password ? <span className='text-rose-500'>{formik.errors.password}</span> : <></>} */}

                    <div className={`${styles.input_group} ${formik.errors.cpassword && formik.touched.cpassword ? 'border-rose-600' : ''}`}>
                        <input 
                        type={`${show.cpassword ? "text" : "password"}`}
                        name='cpassword'
                        placeholder='Confirm Password'
                        className={styles.input_text}
                        {...formik.getFieldProps('cpassword')}
                        />
                        <span className='icon flex items-center px-4' onClick={() => setShow({ ...show, cpassword: !show.cpassword})}>
                            <HiFingerPrint size={25} />
                        </span>
                    </div>
                    {/* {formik.errors.cpassword && formik.touched.cpassword ? <span className='text-rose-500'>{formik.errors.cpassword}</span> : <></>} */}

                    {/* login buttons */}
                    <div className="input-button">
                        <button type='submit' className={styles.button}>
                            Sign Up
                        </button>
                    </div>
                </form>

                {/* bottom */}
                <p className='text-center text-gray-400 '>
                    Have an account? <Link href={'/login'} className='text-blue-700'>Sign In</Link>
                </p>
            </section>
            </Layout_login>

        </Layout>
        
    )
}