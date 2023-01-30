import Head from 'next/head'
import Layout_login from '../../layout_login/layout_login'
import Link from 'next/link'
import styles from '../../styles/Form.module.css';
import Image from 'next/image'
import { HiAtSymbol, HiFingerPrint, HiOutlineUser } from "react-icons/hi";
import { useState } from 'react';
import { Field, useFormik } from 'formik';
import { registerValidate } from '../../lib/validate'
import router, { useRouter } from 'next/router';
import Layout from "../../components/layout"
import {dietPreferencesFood} from "../../lib/dietPreference"
import {foodMeasureUnit} from "../../lib/foodMeasureUnit"
import * as Yup from "yup";
import { toast } from 'react-toastify';
import { GetServerSideProps } from 'next';

export default function Register(){

    interface FormValues {
        name: string;
        foodMeasureUnit: string;
        diet: string[];
    }

    const initialValues: FormValues = {
        name : '',
        foodMeasureUnit: '',
        diet: [],
    }

    const validationSchemaYup: Yup.SchemaOf<FormValues> = Yup.object().shape({
        name: Yup.string().required('Item name required').min(2, "The name must have at least 2 characters!")
        .max(20, "The name must have maximum 20 characters!")
        .test("Empty space", "Name can not start with SPACE!", function(value) {if (value) return  !(value.charAt(0) === " "); else return true }),
        foodMeasureUnit: Yup.string().required('Food measuring unit required'),
        diet: Yup.array(Yup.string()).min(1, 'Select at least 1 diet oprion!')
    });
   
    const formik = useFormik({
        initialValues: initialValues,
        //validate: registerValidate,
        validationSchema: validationSchemaYup,
        onSubmit
    })

    async function onSubmit(values: FormValues){

        const foodItem_api_body: FormValues ={
            name: values.name.charAt(0).toUpperCase() + values.name.slice(1).toLowerCase(),
            foodMeasureUnit: values.foodMeasureUnit,
            diet: values.diet
        }
        const options = {
            method: "POST",
            headers : { 'Content-Type': 'application/json'},
            body: JSON.stringify(foodItem_api_body)
        }
        //console.log(foodItem_api_body)
        // console.log(user_api_body)

        await fetch('/api/meal/foodItem', options)
        .then(res => res.json())
        .then((data) => {
            console.log(data)
            toast(data.message)
            //if(data) router.push('/')
        })
    }

    return (
        
        <Layout>

            <Head>
                <title>Add Food Item</title>
            </Head>

            <section className='flex flex-col justify-evenly gap-10 m-auto bg-slate-50 rounded-md w-3/5 text-center py-4 px-4'> 
                <div className="title">
                    <h1 className='text-gray-800 text-4xl font-bold py-4'>Add Food Item</h1>
                </div>

                {/* form */}
                <form className='flex flex-col gap-5' onSubmit={formik.handleSubmit}>
                    <div className={`${styles.input_group} ${formik.errors.name && formik.touched.name ? 'border-rose-600' : ''}`}>
                        <input 
                        type="text"
                        name='Name'
                        placeholder='Food name'
                        className={styles.input_text}
                        {...formik.getFieldProps('name')}
                        />
                    </div>
                    
                    {formik.errors.name && formik.touched.name ? <span className='text-rose-500'>{formik.errors.name}</span> : <></>}
                    {/* {formik.errors.username && formik.touched.username ? <span className='text-rose-500'>{formik.errors.username}</span> : <></>} */}
                    

                    <div className={`${styles.input_group} ${formik.values.foodMeasureUnit == '' && formik.touched.name ? 'border-rose-600' : ''}`}>
                        <select name="dietPreference" value={formik.values.foodMeasureUnit} className={styles.input_text} {...formik.getFieldProps('foodMeasureUnit')}>
                            {<option value="" disabled={true}>Please Choose a food measuring unit</option>}
                            {foodMeasureUnit.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
                        </select>
                    </div>  
                    {formik.errors.foodMeasureUnit && formik.touched.foodMeasureUnit ? <span className='text-rose-500'>{formik.errors.foodMeasureUnit}</span> : <></>}
                    
                    <div>
                        <div className='text-left' id="checkbox-group">Dietary suitability:</div>
                        <div className={styles.input_group} role="group" aria-labelledby="checkbox-group">
                            {dietPreferencesFood.map((diet) => 
                            <label className='mr-3' key={diet}>
                                <input className='mr-1' type="checkbox" name="diet" {...formik.getFieldProps('diet')} value={diet} />
                            {diet} </label>)}
                        </div>

                        {formik.errors.diet && formik.touched.diet ? <span className='text-rose-500'>{formik.errors.diet}</span> : <></>}
                    </div>
                   
                    {/* login buttons */}
                    <div className="input-button">
                        <button type='submit' className={styles.button}>
                            Add Food Item
                        </button>
                    </div>
                </form>
            </section>

        </Layout>
        
    )
}

export const getServerSideProps: GetServerSideProps = async (context) => {

        if (!foundItem) {
            return {
              props: { hasError: true },
            }
        }
        
        return {
          props: {
            specificStarData: foundItem
          }
        }
  }