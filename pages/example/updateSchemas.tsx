import Head from 'next/head'
import Layout_login from '../../layout_login/layout_login'
import Link from 'next/link'
import styles from '../../styles/Form.module.css';
import Image from 'next/image'
import { HiAtSymbol, HiFingerPrint, HiOutlineUser } from "react-icons/hi";
import { useState } from 'react';
import { useFormik } from 'formik';
import { registerValidate } from '../../lib/validate'
import router, { useRouter } from 'next/router';
import Layout from "../../components/layout"
import {dietPreferences} from "../../lib/dietPreference"
import * as Yup from "yup";
import { toast } from 'react-toastify';

export default function Register(){

    async function onSubmit(){
        

        // const response = await uploadImage(values.image)

        // //console.log(response)

        // if (response.public_id) {
        //     const user_api_body: IApiBody ={
        //         username: values.username,
        //         email: values.email,
        //         noDiet: values.noDiet,
        //         dietPreference: values.dietPreference,
        //         password: values.password,
        //         public_id: response.public_id as string
        //     }
        //     const options = {
        //         method: "POST",
        //         headers : { 'Content-Type': 'application/json'},
        //         body: JSON.stringify(user_api_body)
        //     }
        //     //console.log(values)
        //     // console.log(user_api_body)

        //     await fetch('/api/user/register', options)
        //     .then(res => res.json())
        //     .then((data) => {
        //         console.log(data)
        //         toast(data.message)
        //         if(data) router.push('/user/login')
        //     })
        // }
    }

    async function handleSchemaUser() {
        const options = {
            method: "POST",
            headers : { 'Content-Type': 'application/json'},
            body: JSON.stringify({test: "test"})
        }
        //console.log(values)
        // console.log(user_api_body)

        await fetch('/api/examples/updateSchemaUser', options)
        .then(res => res.json())
        .then((data) => {
            console.log(data)
            toast(data.message)
            //if(data) router.push('/user/login')
        })
    }

    async function handleSchemaFood() {
        const options = {
            method: "POST",
            headers : { 'Content-Type': 'application/json'},
            body: JSON.stringify({test: "test"})
        }
        //console.log(values)
        // console.log(user_api_body)

        await fetch('/api/examples/updateSchemaFood', options)
        .then(res => res.json())
        .then((data) => {
            console.log(data)
            toast(data.message)
            //if(data) router.push('/user/login')
        })
    }

    async function handleSchemaMeal() {
        const options = {
            method: "POST",
            headers : { 'Content-Type': 'application/json'},
            body: JSON.stringify({test: "test"})
        }
        //console.log(values)
        // console.log(user_api_body)

        await fetch('/api/examples/updateSchemaMeal', options)
        .then(res => res.json())
        .then((data) => {
            console.log(data)
            toast(data.message)
            //if(data) router.push('/user/login')
        })
    }
    

    return (
        
        <Layout>

            <Head>
                <title>Register</title>
            </Head>

            <section className='flex flex-col justify-evenly gap-10 m-auto bg-slate-50 rounded-md w-3/5 text-center py-4 px-4'> 
                <div className="title">
                    <h1 className='text-gray-800 text-4xl font-bold py-4'>Update schemas</h1>
                </div>

               
                <button type='submit' className={styles.button} onClick={handleSchemaUser}>
                    Update Users Schema
                </button>

                <br></br>

                <button type='submit' className={styles.button} onClick={handleSchemaFood}>
                    Update Food Schema
                </button>

                <button type='submit' className={styles.button} onClick={handleSchemaMeal}>
                    Update Meal Schema
                </button>


            </section>

        </Layout>
        
    )
}