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
    
    async function uploadImage(
        image: File | string
        ) {
        var userImage = sessionObj.user.image
        if (image) {
            const url = 'https://api.cloudinary.com/v1_1/' + process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME + '/image/upload';
    
            const formData = new FormData();
            formData.append('file', image);
            formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_PRESET);
    
            const response = await fetch(url, {
                method: 'post',
                body: formData,
                mode: 'cors'
            }).then(r => r.json());
            userImage = response.public_id as string
        }
    
        return userImage;
    }
    
    async function onSubmit(values: FormValues){
        //console.log(values)
        const confPassword = await compare(values.oldPassword, sessionObj.user.password)
    
        if (confPassword) {
            const response = await uploadImage(values.image)
            //console.log(response)
        
            if (response) {
                const user_api_body: IApiBody ={
                    username: values.username,
                    email: values.email,
                    dietPreference: values.dietPreference,
                    password: values.password,
                    public_id: response
                }
                const options = {
                    method: "PUT",
                    headers : { 'Content-Type': 'application/json'},
                    body: JSON.stringify(user_api_body)
                }
                // console.log(values)
                //console.log(user_api_body)
        
                await fetch('/api/user/update', options)
                .then(res => res.json())
                .then((data) => {
                    //console.log(data)
                    //alert(data.message)
                    toast(data.message)
                    if(data.user) signOut()//router.push('/user/login')
                })
            }
        } else {
            //alert("Old password doesn't match!")
            toast.error("Old password doesn't match!")
        }
    }
    

    const [previewImage, setPreviewImage] = useState<string>()
    const [show, setShow] = useState({ password: false, cpassword: false, oldPassword: false })


    const user = sessionObj.user
    const initialValues: FormValues = {
        username : user.username,
        email: user.email,
        dietPreference: user.dietPreference,
        oldPassword: '',
        password: '',
        cpassword: '',
        image: null
    }
    

    const SUPPORTED_FORMATS: string[] = ['image/jpg', 'image/png', 'image/jpeg', 'image/gif'];

    const validationSchemaYup: Yup.SchemaOf<FormValues> = Yup.object().shape({
        username: Yup.string().required('Username required')
        .test("Empty space", "Invalid username, spaces not allowed!", function(value) {if (value) return !value.includes(" "); else return true }),
        email: Yup.string().email().required('Email required'),
        dietPreference: Yup.array(Yup.string()).min(1, 'Select at least 1 diet oprion!'),
        oldPassword: Yup.string().required('Old password required'),
        //.test("Match old password", "Incorrect password!", async function(value) {if (value) return await compare(value, user.password) }),
        password: Yup.string().required('Password required').min(8, 'Password must be min 8 characters')
        .max(20, 'Password must be max 20 characters')
        .test("Empty space", "Invalid password, spaces not allowed!", function(value) {if (value) return !value.includes(" "); else return true }),
        cpassword: Yup.string().required('Confirm password required')
        .test("Confirm password", "Password doesn't match!", function(item) {return (this.parent.password == this.parent.cpassword)})
        .test("Empty space", "Invalid password, spaces not allowed!", function(value) {if (value) return !value.includes(" "); else return true }),
        image: Yup.mixed().nullable().test('size', 'File size is too big',
        function(value) {if (value) {return value.size <= 1024 * 1024} else {return true} }// 5MB
        ).test('type','Invalid file format selection',
        (value) =>
        !value || (value && SUPPORTED_FORMATS.includes(value?.type))
        )
    });

    const formik = useFormik({
        initialValues: initialValues,
        //validate: registerValidate,
        validationSchema: validationSchemaYup,
        onSubmit
    })

    return (
        
        <Layout>

            <Head>
                <title>Register</title>
            </Head>
            <ToastContainer />

            <section className='flex flex-col justify-evenly gap-10 m-auto bg-slate-50 rounded-md w-3/5 text-center py-4 px-4'> 
                <div className="title">
                    <h1 className='text-gray-800 text-4xl font-bold py-4'>Update User Details</h1>
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
                    {formik.errors.email && formik.touched.email ? <span className='text-rose-500'>{formik.errors.email}</span> : <></>}
                    {/* {formik.errors.email && formik.touched.email ? <span className='text-rose-500'>{formik.errors.email}</span> : <></>} */}
                    

                    { /* <div className={`${styles.input_group} ${formik.values.dietPreference == '' && formik.touched.username ? 'border-rose-600' : ''}`}>
                        <select name="dietPreference" value={formik.values.dietPreference} className={styles.input_text} {...formik.getFieldProps('dietPreference')}>
                            {<option value="" disabled={true}>Please Choose a diet plan</option>}
                            {dietPreferences.map((diet) => <option key={diet} value={diet}>{diet}</option>)}
                        </select>
                    </div>  
                    {formik.errors.dietPreference && formik.touched.dietPreference ? <span className='text-rose-500'>{formik.errors.dietPreference}</span> : <></>} */ }

                    <div>
                        <div className='text-left' id="checkbox-group">Dietary suitability:</div>
                        <div className={styles.input_group} role="group" aria-labelledby="checkbox-group">
                            {dietPreferences.map((diet) => 
                            <label className='mr-3' key={diet}>
                                <input className='mr-1' type="checkbox" name="dietPreference" {...formik.getFieldProps('dietPreference')} value={diet} 
                                checked={(formik.values.dietPreference.indexOf(diet) > -1) ? true : false}
                                /> {/* defaultChecked={(formik.values.diet.indexOf(diet) > -1) ? true : false}   */}
                            {diet} </label>)}
                        </div>

                        {formik.errors.dietPreference && formik.touched.dietPreference ? <span className='text-rose-500'>{formik.errors.dietPreference}</span> : <></>}
                    </div>


                    <div className={`${styles.input_group} ${formik.errors.oldPassword && formik.touched.oldPassword ? 'border-rose-600' : ''}`}>
                        <input 
                        type={`${show.oldPassword ? "text" : "password"}`}
                        name='oldPassword'
                        placeholder='Confirm the old password'
                        className={styles.input_text}
                        {...formik.getFieldProps('oldPassword')}
                        />
                        <span className='icon flex items-center px-4' onClick={() => setShow({ ...show, oldPassword: !show.oldPassword})}>
                            <HiFingerPrint size={25} />
                        </span>
                    </div>
                    {formik.errors.oldPassword && formik.touched.oldPassword ? <span className='text-rose-500'>{formik.errors.oldPassword}</span> : <></>}
                    {/* {formik.errors.password && formik.touched.password ? <span className='text-rose-500'>{formik.errors.password}</span> : <></>} */}


                    <div className={`${styles.input_group} ${formik.errors.password && formik.touched.password ? 'border-rose-600' : ''}`}>
                        <input 
                        type={`${show.password ? "text" : "password"}`}
                        name='password'
                        placeholder='New Password'
                        className={styles.input_text}
                        {...formik.getFieldProps('password')}
                        />
                        <span className='icon flex items-center px-4' onClick={() => setShow({ ...show, password: !show.password})}>
                            <HiFingerPrint size={25} />
                        </span>
                    </div>
                    {formik.errors.password && formik.touched.password ? <span className='text-rose-500'>{formik.errors.password}</span> : <></>}
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
                    {formik.errors.cpassword && formik.touched.cpassword ? <span className='text-rose-500'>{formik.errors.cpassword}</span> : <></>}
                    {/* {formik.errors.cpassword && formik.touched.cpassword ? <span className='text-rose-500'>{formik.errors.cpassword}</span> : <></>} */}


                    <div className='flex justify-start'>
                    <input
                    name='image' //NAME field not required in this case as image is set through onChange
                    type='file'
                    onChange={(event) => {
                        formik.setFieldValue(
                        'image',
                        event.target.files[0]
                        );
                        if (event?.target?.files?.[0]) {
                            const file = event.target.files[0];
                            const reader = new FileReader();
                            reader.onloadend = () => {
                            setPreviewImage(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                        }
                    }}
                    className={''}
                    ></input>
                    </div>

                    {formik.errors.image && formik.touched.image ? <span className='text-rose-500'>{formik.errors.image}</span> : <></>}

                    <div>
                        {formik.values.image ?
                            <img
                                src={previewImage}
                                className="mt-4 object-cover"
                                style={{ width: "440px", height: `${300}px` }}
                            />
                            : <>
                                <div>Existing Image</div>
                                <Image
                                    className="mt-4"
                                    cloudName={process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}
                                    publicId={sessionObj.user.image}
                                    alt={sessionObj.user.image}
                                    secure
                                    dpr="auto"
                                    quality="auto"
                                    //width={576}
                                    //height={Math.floor((9 / 16) * 576)}
                                    crop="fill"
                                    gravity="auto" />
                            </>
                        }
                    </div>


                    {/* login buttons */}
                    <div className="input-button">
                        <button type='submit' className={styles.button}>
                            Update User
                        </button>
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