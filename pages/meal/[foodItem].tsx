import Head from 'next/head'
import Layout_login from '../../layout_login/layout_login'
import Link from 'next/link'
import styles from '../../styles/Form.module.css';
import { HiAtSymbol, HiFingerPrint, HiOutlineUser } from "react-icons/hi";
import { useEffect, useState } from 'react';
import { Field, useFormik } from 'formik';
import { registerValidate } from '../../lib/validate'
import router, { useRouter } from 'next/router';
import Layout from "../../components/layout"
import {dietPreferencesFood} from "../../lib/dietPreference"
import {foodMeasureUnit} from "../../lib/foodMeasureUnit"
import * as Yup from "yup";
import { toast } from 'react-toastify';
import { GetServerSideProps } from 'next';
import { IFood } from '../../models/FoodItem';
import { Schema } from 'mongoose';
import {useSession } from "next-auth/react"
import { Image } from "cloudinary-react";

interface ServiceInit {
    status: 'init';
  }
  interface ServiceLoading {
    status: 'loading';
  }
  interface ServiceLoaded<T> {
    status: 'loaded';
    payload: T;
  }
  interface ServiceError {
    status: 'error';
    error: string;
  }
  type Service<T> =
    | ServiceInit
    | ServiceLoading
    | ServiceLoaded<T>
    | ServiceError;

interface IFoodItems {
    results: IFood;
}

export default function UpdateFood(foodItemProps){
    const { data: session, status } = useSession()
    const [previewImage, setPreviewImage] = useState<string>()
    const [foodItems, setFoodItems] = useState<Service<IFoodItems>>({status: 'loading'})

    async function uploadImage(
        image: File | string
        ) {
        var foodImage = foodItemProps.response.payload.results[0].image
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
            foodImage = response.public_id as string
        }
    
        return foodImage;
    }

    //console.log(foodItemProps)

    useEffect(() => {
        if(foodItemProps.response.status == 'error') {
            setFoodItems({ status: 'error', error: foodItemProps.response.error})
        } else {
            setFoodItems({ status: 'loaded', payload: foodItemProps.response.payload })
            //console.log(foodItemProps)
        }
    },[])

    //console.log(foodItems)

    interface FormValues {
        name: string;
        privateBool: boolean;
        foodMeasureUnit: string;
        diet: string[];
        snack: boolean;
        image?: File | string;
    }

    interface IfoodApi extends FormValues {
        id: Schema.Types.ObjectId
    }

    const initialValues: FormValues = {
        name : foodItemProps.response.status == 'loaded' ? foodItemProps.response.payload.results[0].name : '',
        privateBool: foodItemProps.response.status == 'loaded' ? foodItemProps.response.payload.results[0].privateBool : false,
        foodMeasureUnit: foodItemProps.response.status == 'loaded' ? foodItemProps.response.payload.results[0].foodMeasureUnit : '',
        diet: foodItemProps.response.status == 'loaded' ? foodItemProps.response.payload.results[0].diet : [],
        snack: foodItemProps.response.status == 'loaded' ? foodItemProps.response.payload.results[0].snack : false,
        image: null,
    }

    const SUPPORTED_FORMATS: string[] = ['image/jpg', 'image/png', 'image/jpeg', 'image/gif'];

    const validationSchemaYup: Yup.SchemaOf<FormValues> = Yup.object().shape({
        name: Yup.string().required('Item name required').min(2, "The name must have at least 2 characters!")
        .max(20, "The name must have maximum 20 characters!")
        .test("Empty space", "Name can not start with SPACE!", function(value) {if (value) return  !(value.charAt(0) === " "); else return true }),
        privateBool: Yup.bool().required(),
        foodMeasureUnit: Yup.string().required('Food measuring unit required'),
        diet: Yup.array(Yup.string()).min(1, 'Select at least 1 diet oprion!'),
        snack: Yup.bool().required(),
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

    async function onSubmit(values: FormValues){
        const response = await uploadImage(values.image)

        if (response) {
            const foodItem_api_body: IfoodApi ={
                name: values.name.charAt(0).toUpperCase() + values.name.slice(1).toLowerCase(),
                privateBool: values.privateBool,
                foodMeasureUnit: values.foodMeasureUnit,
                diet: values.diet,
                snack: values.snack,
                image: response,
                id: foodItemProps.response.payload.results[0]._id
            }
            const options = {
                method: "PUT",
                headers : { 'Content-Type': 'application/json'},
                body: JSON.stringify(foodItem_api_body)
            }
            console.log(foodItem_api_body)

            await fetch('/api/meal/foodItem', options)
            .then(res => res.json())
            .then((data) => {
                console.log(data)
                toast(data.message)
                //if(data) router.push('/')
            })
        } else {
            toast('Image could not be uploaded.')
        }
    }

    return (
        
        <Layout>

            <Head>
                <title>Update Food Item</title>
            </Head>

            <section className='min-w-[250px] max-w-[320px] md:max-w-[900px] items-center mx-auto flex flex-col gap-3 mt-4 md:mt-8'> 
                 <div className="flex justify-start">
                    <p className='font-bold md:text-xl'>Update Food Item:</p>
                </div>

                {foodItems.status === 'loading' && <div>Loading...</div>}
                {foodItems.status === 'loaded' &&  (
                    <form className='flex flex-col items-center gap-5' onSubmit={formik.handleSubmit}>
                        <div className='flex flex-col md:flex-row md:gap-x-10 gap-5'>
                            <div className='flex flex-col gap-5'>
                                <div className='flex flex-col'>
                                    <div className={`${styles.input_group} ${formik.errors.name && formik.touched.name ? 'border-rose-600' : ''}`}>
                                        <input 
                                        type="text"
                                        name='Name'
                                        placeholder='Food name'
                                        className={`${styles.input_text} `}
                                        {...formik.getFieldProps('name')}
                                        />
                                    </div>
                                    {formik.errors.name && formik.touched.name ? 
                                    <span className={`${styles.formikError}`}>{formik.errors.name}</span> : <></>}
                                    {/* {formik.errors.username && formik.touched.username ? <span className='text-rose-500'>{formik.errors.username}</span> : <></>} */}
                                </div>

                                <div className='flex flex-col'>
                                    <div className={`${styles.input_group} ${formik.values.foodMeasureUnit == '' && formik.touched.name ? 'border-rose-600' : ''}`}>
                                        <select name="dietPreference" value={formik.values.foodMeasureUnit} 
                                        className={styles.input_text} {...formik.getFieldProps('foodMeasureUnit')}>
                                            {<option value="" disabled={true}>Select a food measuring unit</option>}
                                            {foodMeasureUnit.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
                                        </select>
                                    </div>  
                                    {formik.errors.foodMeasureUnit && formik.touched.foodMeasureUnit ? 
                                    <span className={`${styles.formikError}`}>{formik.errors.foodMeasureUnit}</span> : <></>}
                                </div>

                                <div className={`${styles.input_group} flex-col bg-green-100 
                                ${formik.errors.diet && formik.touched.diet ? 'border-rose-600' : ''}`}>
                                    <div className='text-left ml-3 mt-1 font-medium text-sm md:text-base' id="checkbox-group">Dietary suitability:</div>
                                    <div className={`flex flex-col mb-1`} role="group" aria-labelledby="checkbox-group">
                                        {dietPreferencesFood.map((diet) => 
                                        <label className='mr-3 ml-3 mt-1 text-sm md:text-base' key={diet}>
                                            <input className='mr-1' type="checkbox" name="diet" {...formik.getFieldProps('diet')} value={diet} 
                                            defaultChecked={(foodItems.payload.results[0].diet.indexOf(diet) > -1) ? true : false}/>
                                        {diet} </label>)}
                                    </div>
                                    {formik.errors.diet && formik.touched.diet ? 
                                    <span className='text-rose-500 mb-1 ml-1 text-sm md:text-base'>{formik.errors.diet}</span> : <></>}
                                </div>
                            </div>


                            <div className='flex flex-col items-center gap-5'>
                                <div className={`${styles.input_group} flex-col bg-green-100`}>
                                    <label className='mr-3 ml-3 mt-1 text-sm md:text-base'>
                                        <input type="radio" name="privateBool" className='mr-1' checked={formik.values.privateBool === true}
                                        disabled={session ? (session.user.userRole == "admin" ? false : true) : true}
                                        onChange={() => formik.setFieldValue("privateBool", true)}
                                        />
                                        Private Food Item
                                    </label>
                                    <label className='mr-3 ml-3 mt-1 mb-1 text-sm md:text-base'>
                                        <input type="radio" name="privateBool" className='mr-1' checked={formik.values.privateBool === false}
                                        disabled={session ? (session.user.userRole == "admin" ? false : true) : true}
                                        onChange={() => formik.setFieldValue("privateBool", false)}
                                        />
                                        Public Food Item
                                    </label>
                                    {/* <div>{`Private: ${formik.values.private}`}</div> */}
                                </div>

                                <div className={`${styles.input_group} flex-col bg-green-100`}>
                                    <label className='mr-3 ml-3 mt-1 text-sm md:text-base'>
                                        <input type="radio" name="snack" className='mr-1' checked={formik.values.snack === false}
                                        onChange={() => formik.setFieldValue("snack", false)}
                                        />
                                        Food Item suitable for meals only
                                    </label>
                                    <label className='mr-3 ml-3 mt-1 mb-1 text-sm md:text-base'>
                                        <input type="radio" name="snack" className='mr-1' checked={formik.values.snack === true}
                                        onChange={() => formik.setFieldValue("snack", true)}
                                        />
                                        Food Item suitable for meals and snacks
                                    </label>
                                    {/*  <div>{`Suitable for snacking: ${formik.values.snack}`}</div> */}
                                </div>

                                <div className='flex flex-col'>
                                    <label htmlFor="image" className={`${styles.button} min-w-[150px] max-w-[200px] text-center`}>
                                        Choose File
                                    </label>
                                    <input
                                    name='image' //NAME field not required in this case as image is set through onChange
                                    type='file'
                                    id="image"
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
                                    className={'hidden'}
                                    ></input>

                                    {formik.errors.image && formik.touched.image ? 
                                    <span className='text-rose-500 mt-1 ml-1 text-sm md:text-base'>{formik.errors.image}</span> : <></>}
                                </div>

                                <div>
                                    {formik.values.image ?
                                        <>  
                                            <img
                                            src={previewImage}
                                            className={`${styles.avatar} `}
                                            />
                                        </>
                                        : <>
                                            <div className='text-center'>Existing Image</div>
                                            <Image
                                                className={`${styles.avatar} `}
                                                cloudName={process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}
                                                publicId={foodItemProps.response.status == 'loaded' ? foodItemProps.response.payload.results[0].image : ""}
                                                alt={foodItemProps.response.status == 'loaded' ? foodItemProps.response.payload.results[0].image : ""}
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
                            </div>
                        </div>

                        {/* login buttons */}
                        <div className="mt-3 min-w-[150px] max-w-[200px]">
                            <button type='submit' className={styles.button}>
                                Update Food Item
                            </button>
                        </div>
                    </form>
                )}

                {foodItems.status === 'error' && (
                    <div>{foodItems.error}</div>
                )}

            </section>

        </Layout>
        
    )
}

function return_url(context) {
    if (process.env.NODE_ENV === "production") {
      return `https://${context.req.rawHeaders[1]}`;
    } else {
      return "http://localhost:3000";
    }
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    let url = return_url(context);
    const foodNameQuerry = context.params?.foodItem;
    let responseLoaded, responseError

    //console.log(foodNameQuerry)

    const options = {
        method: "GET",
        headers : { 'Content-Type': 'application/json'},
      }
      await fetch(`${url}/api/meal/getFoodItems?foodName=${foodNameQuerry}&limit=1`, options)
      .then(async (response) => {
        if (!response.ok) {
          const error = await response.json()
          //console.log(error)
          throw new Error(error)
          //toast.success(`Logged in as ${values.email}`)
        } else {
          return response.json()
        }
      })
      .then(data => responseLoaded = { status: 'loaded', payload: data })
      .catch(err => responseError = { status: 'error', error: err.message});
    

        if (responseError) {
            return {
              props: { response: responseError },
            }
        }
        
        return {
          props: {response: responseLoaded}
        }
    }