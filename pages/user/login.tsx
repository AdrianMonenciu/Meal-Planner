import Head from 'next/head'
import Layout_login from '../../layout_login/layout_login'
import Link from 'next/link'
import styles from '../../styles/Form.module.css';
import Image from 'next/image'
import { HiAtSymbol, HiFingerPrint } from "react-icons/hi";
import { useState } from 'react';
import { signIn, signOut, useSession } from "next-auth/react"
import { useFormik } from 'formik';
import login_validate from '../../lib/validate';
import { useRouter } from 'next/router';
import Layout from "../../components/layout"
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';


export default function Login(){
    const { data } = useSession()
    //console.log(data)

    interface FormValues {
        email: string;
        password: string;
    }

    const initialValues: FormValues = {
        email: "",
        password: "",
    }

    const [show, setShow] = useState(false)
    const router = useRouter()
    // formik hook
    const formik = useFormik({
        initialValues: initialValues,
        validate : login_validate,
        onSubmit
    })

    /**
     * haleykennedy@gmail.com
     * admin123
     */

    async function onSubmit(values: FormValues){
        const status = await signIn('credentials', {
            redirect: false,
            email: values.email,
            password: values.password,
            callbackUrl: "http://localhost:3000/"
        }).then(({ ok, error }) => {
            if (ok) {
                toast.success(`Logged in as ${values.email}`)
                router.push("/");
            } else {
                //console.log(error)
                toast.error(error);
            }
        })

        // if(status.error){
        //     return toast.error(status.error)
        // }

        // if(status.ok) { 
        //     router.push(status.url) 
        // }  
    }

    // Google Handler function
    async function handleGoogleSignin(){
        signIn('google', { callbackUrl : "http://localhost:3000"})
    }

    // Github Login 
    async function handleGithubSignin(){
        signIn('github', { callbackUrl : "http://localhost:3000"})
    }

    return (
        <Layout>

            {data ? (<div> Already signed in as: {JSON.stringify(data.user.username, null, 2)} </div>) :

                <Layout_login>

                <Head>
                    <title>Login</title>
                </Head>
                <ToastContainer />
                
                <section className='w-3/4 mx-auto flex flex-col gap-3'>
                    <div className="title">
                        <h1 className='text-gray-800 text-4xl font-bold py-4'>Explore</h1>
                        <p className='w-3/4 mx-auto text-gray-400'>Description text goes here.</p>
                    </div>

                    {/* form */}
                    <form className='flex flex-col gap-5' onSubmit={formik.handleSubmit}>
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
                    
                        {formik.errors.email && formik.touched.email ? <span className='text-rose-500 text-sm py-0'>{formik.errors.email}</span> : <></>}

                        <div className={`${styles.input_group} ${formik.errors.password && formik.touched.password ? 'border-rose-600' : ''}`}>
                            <input 
                            type={`${show ? "text" : "password"}`}
                            name='password'
                            placeholder='password'
                            className={styles.input_text}
                            {...formik.getFieldProps('password')}
                            />
                            <span className='icon flex items-center px-4' onClick={() => setShow(!show)}>
                                <HiFingerPrint size={25} />
                            </span>
                        
                        </div>

                        {formik.errors.password && formik.touched.password ? <span className='text-rose-500 text-sm py-0'>{formik.errors.password}</span> : <></>}

                        {/* {formik.errors.password && formik.touched.password ? <span className='text-rose-500'>{formik.errors.password}</span> : <></>} */}
                        {/* login buttons */}
                        <div className="input-button">
                            <button type='submit' className={styles.button}>
                                Login
                            </button>
                        </div>
                        <div className="input-button">
                            <button type='button' onClick={handleGoogleSignin} className={styles.button_custom}>
                                Sign In with Google <Image src={'/assets/google.svg'} width="20" height={20} alt={''} ></Image>
                            </button>
                        </div>
                        <div className="input-button">
                            <button type='button' onClick={handleGithubSignin} className={styles.button_custom}>
                                Sign In with Github <Image src={'/assets/github.svg'} width={25} height={25} alt={''}></Image>
                            </button>
                        </div>
                    </form>

                    {/* bottom */}
                    <p className='text-center text-gray-400 '>
                        don't have an account yet? <Link href={'/register'} className='text-blue-700'>Sign Up</Link>
                    </p>
                </section>

                </Layout_login>
            }

        </Layout>
    )
}