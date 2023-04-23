import Head from 'next/head'
import Layout_login from '../../layout_login/layout_login'
import Link from 'next/link'
import styles from '../../styles/Form.module.css';
//import Image from 'next/image'
import { Image } from "cloudinary-react";
import { HiAtSymbol, HiFingerPrint, HiOutlineUser } from "react-icons/hi";
import { useState } from 'react';
import { useFormik } from 'formik';
import { registerValidate } from '../../lib/validate'
import router, { useRouter } from 'next/router';
import Layout from "../../components/layout"
import {dietPreferences} from "../../lib/dietPreference"
import * as Yup from "yup";
import { signOut, useSession } from 'next-auth/react';
import { compare } from 'bcryptjs';
import type { Session } from "next-auth"
import { unstable_getServerSession } from "next-auth/next"
import type { GetServerSidePropsContext, GetServerSideProps } from "next"
import { authOptions } from "../api/auth/[...nextauth]"
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';

interface FormValues {
    username: string;
    email: string;
    noDiet: boolean;
    dietPreference: string[];
    oldPassword?: string;
    password: string;
    cpassword?: string;
    image?: File | string;
}

interface IApiBody extends FormValues {
    public_id: string;
}


export default function UpdateUser({ sessionObj }: { sessionObj: Session }){
    const user = sessionObj.user
    const initialValues: FormValues = {
        username : user.username,
        email: user.email,
        noDiet: user.noDiet,
        dietPreference: user.dietPreference,
        oldPassword: '',
        password: '',
        cpassword: '',
        image: null
    }

    return (
        
        <Layout>

            <Head>
                <title>View</title>
            </Head>
            <ToastContainer />

            <section className='min-w-[250px] max-w-[320px] md:max-w-[500px] items-center mx-auto flex flex-col gap-3 mt-4 md:mt-8'> 
                <div className="flex justify-start">
                    <p className='font-bold md:text-xl'>View User Details:</p>
                </div>

                {/* form */}
                <form className='flex flex-col gap-5 items-center'>
                    <div className='flex flex-col'>
                        <div className={`${styles.input_group}`}>
                            <div className={styles.input_text}>{initialValues.username} </div>
                            <span className='icon flex items-center px-4'>
                                <HiOutlineUser size={25} />
                            </span>
                        </div>
                    </div>


                    <div className='flex flex-col'>
                        <div className={`${styles.input_group}`}>
                            <div className={styles.input_text}>{initialValues.email}</div>
                            <span className='icon flex items-center px-4'>
                                <HiAtSymbol size={25} />
                            </span>
                        </div>
                    </div>

                    <div className={`${styles.input_group} flex-col bg-green-100`}>
                        <div className={`mt-2 ml-1 mb-2 w-full`}>
                            <label className='mr-3 font-medium text-sm md:text-base'>
                                <input 
                                type="checkbox" 
                                name="noDiet" 
                                className={`mr-1`}
                                checked={initialValues.noDiet} 
                                disabled={true}
                                />
                            No dietary restrictions
                            </label>
                        </div>

                        <div className='text-left ml-1 font-medium text-sm md:text-base' id="checkbox-group">Dietary restrictions:</div>
                        <div className={`flex flex-col mb-1`} role="group" aria-labelledby="checkbox-group">
                            {dietPreferences.map((diet) => 
                            <label className={`mr-3 ml-3 mt-1 text-sm md:text-base`} key={diet}>
                                <input className={`mr-1`}
                                type="checkbox" name="dietPreference" value={diet} 
                                checked={(initialValues.dietPreference.indexOf(diet) > -1) ? true : false}
                                disabled={true}
                                /> {/* defaultChecked={(formik.values.diet.indexOf(diet) > -1) ? true : false}   */}
                            {diet} </label>)}
                        </div>
                    </div>


                    <div>
                        <div className='text-center'>Profile Image</div>
                        <Image
                            className={`${styles.avatar} `}
                            cloudName={process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}
                            publicId={sessionObj.user.image}
                            alt={sessionObj.user.image}
                            secure
                            dpr="auto"
                            quality="auto"
                            //width={576}
                            //height={Math.floor((9 / 16) * 576)}
                            crop="fill"
                            gravity="auto" 
                        />
                    </div>

                </form>

            </section>

        </Layout>
        
    )
}

// Export the `session` prop to use sessions with Server Side Rendering
export const getServerSideProps: GetServerSideProps<{
    sessionObj: Session | null}> = async (context) => {
    return {
      props: {
        sessionObj: await unstable_getServerSession(
          context.req,
          context.res,
          authOptions
        )
      },
    }
  }