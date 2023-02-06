import Head from 'next/head'
import Layout_login from '../../layout_login/layout_login'
import Link from 'next/link'
import styles from '../../styles/Form.module.css';
import Image from 'next/image'
import { HiAtSymbol, HiFingerPrint, HiOutlineUser } from "react-icons/hi";
import { useId, useState } from 'react';
import { ErrorMessage, Field, FieldArray, Form, Formik, useFormik } from 'formik';
import { registerValidate } from '../../lib/validate'
import router, { useRouter } from 'next/router';
import Layout from "../../components/layout"
import {dietPreferencesFood} from "../../lib/dietPreference"
import {foodMeasureUnit} from "../../lib/foodMeasureUnit"
import * as Yup from "yup";
import { toast } from 'react-toastify';
import Select from 'react-select';

export default function Register(){
    const mealOptions = [
        { value: "", label: "" },
      ];

    //   const mealOptions = [
    //     { value: "breakfast", label: "breakfast" },
    //     { value: "brunch", label: "brunch" },
    //     { value: "snack", label: "snack" },
    //     { value: "lunch", label: "lunch" },
    //     { value: "dinner", label: "dinner" }
    //   ];

    const [mealOptionsDynamic, setmealOptionsDynamic] = useState(mealOptions)
    
        interface Inames {
          qty: number, name: string
        }
    
        interface FormValues2 {
          names: Inames[];
          meal: string
        }
    
        const initialMealOptions = ["recipy1", "recipy2", "recipy3"]
    
        const initialValues2: FormValues2 = {
          names: [{name: '', qty: 0}],
          //names: [{name: 'breakfast', qty: 1}, {name: 'breakfast', qty: 2}, {name: 'breakfast', qty: 3}]
          meal: 'snack'
        }
    
        const validationSchema2 = Yup.object().shape({
          names: Yup.array().of(
            Yup.object().shape({
              name: Yup.string().max(10).required(),
              qty: Yup.number().required()
            })
          ).required(),
          meal: Yup.string().max(10).required()
        });
    
    
        // formik hook
        const formik2 = useFormik({
            initialValues: initialValues2,
            onSubmit: onSubmit2
        })
    
        async function onSubmit2(values: FormValues2){
            formik2.resetForm()
          setTimeout(() => {
            //alert(JSON.stringify(values, null, 2));
            console.log(values)
          }, 500)
        }

    interface FormValues {
        name: string;
        diet: string[];
    }

    const initialValues: FormValues = {
        name : '',
        diet: ['Vegan'],
    }

    const validationSchemaYup: Yup.SchemaOf<FormValues> = Yup.object().shape({
        name: Yup.string().required('Item name required').min(2, "The name must have at least 2 characters!")
        .max(20, "The name must have maximum 20 characters!")
        .test("Empty space", "Name can not start with SPACE!", function(value) {if (value) return  !(value.charAt(0) === " "); else return true }),
        diet: Yup.array(Yup.string()).min(1, 'Select at least 1 diet oprion!')
    });
   
    const formik = useFormik({
        initialValues: initialValues,
        //validate: registerValidate,
        validationSchema: validationSchemaYup,
        onSubmit: onSubmit1
    })

    async function onSubmit1(values: FormValues){
        //formik.resetForm()
        //formik2.resetForm()

        setmealOptionsDynamic(values.diet.map((diet, index) => ({value : diet, label : diet})));

        ()=>formik2.resetForm()

        // const foodItem_api_body: FormValues ={
        //     name: values.name.charAt(0).toUpperCase() + values.name.slice(1).toLowerCase(),
        //     diet: values.diet
        // }
        // const options = {
        //     method: "POST",
        //     headers : { 'Content-Type': 'application/json'},
        //     body: JSON.stringify(foodItem_api_body)
        // }
        //console.log(foodItem_api_body)
        console.log(values)

        // await fetch('/api/meal/foodItem', options)
        // .then(res => res.json())
        // .then((data) => {
        //     console.log(data)
        //     toast(data.message)
        //     //if(data) router.push('/')
        // })
    }

    return (
        
        <Layout>

            <Head>
                <title>Add Meal</title>
            </Head>

            <section className='flex flex-col justify-evenly gap-10 m-auto bg-slate-50 rounded-md w-3/5 text-center py-4 px-4'> 
                <div className="title">
                    <h1 className='text-gray-800 text-4xl font-bold py-4'>Add Meal</h1>
                </div>

                {/* form */}
                <form className='flex flex-col gap-5' onSubmit={formik.handleSubmit}>
                    <div className={`${styles.input_group} ${formik.errors.name && formik.touched.name ? 'border-rose-600' : ''}`}>
                        <input 
                        type="text"
                        name='Name'
                        placeholder='Meal name'
                        className={styles.input_text}
                        {...formik.getFieldProps('name')}
                        />
                    </div>
                    
                    {formik.errors.name && formik.touched.name ? <span className='text-rose-500'>{formik.errors.name}</span> : <></>}
                    {/* {formik.errors.username && formik.touched.username ? <span className='text-rose-500'>{formik.errors.username}</span> : <></>} */}
                    
                    <div className='mx-4'>Current Diet: {mealOptionsDynamic.map((diet, index) => `${diet.value} `)}</div>
                 
                    <div>
                        <div className='text-left' id="checkbox-group">Dietary suitability:</div>
                        <div className={styles.input_group} role="group" aria-labelledby="checkbox-group">
                            {dietPreferencesFood.map((diet) => 
                            <label className='mr-3' key={diet}>
                                <input className='mr-1' type="checkbox" name="diet" {...formik.getFieldProps('diet')} value={diet} 
                                checked={(formik.values.diet.indexOf(diet) > -1) ? true : false}
                                /> {/* defaultChecked={(formik.values.diet.indexOf(diet) > -1) ? true : false}   */}
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


            <Formik
            initialValues={initialValues2}
            onSubmit={onSubmit2}
            validationSchema={validationSchema2}
            >
            {({ values, handleSubmit, handleChange, errors, resetForm }) => (
                <>
                <Head>
                    <title>DynamicInput</title>
                </Head>

                <section className='w-3/4 mx-auto flex flex-col gap-3'>
                    <div className="title">
                        <h1 className='text-gray-800 text-4xl font-bold py-4'>Explore</h1>
                        <p className='w-3/4 mx-auto text-gray-400'>Description text goes here.</p>
                    </div>

                    <Form className='flex gap-5' onSubmit={handleSubmit}>
                    <FieldArray
                    name="names"
                    render={arrayHelpers => (
                        <div>
                        {values.names.map((name, index) => (
                            <div key={index} className={`${styles.input_group} flex column justify-evenly color to-blue-200 `}>
                                {/*<Field name={`names.${index}`} className={styles.input_group}/>*/}
                                <Field name={`names[${index}].name`}>
                                {({ field, form }) => (
                                <Select
                                    className="select-wrap"
                                    classNamePrefix="select-box"
                                    instanceId={useId()}
                                    isSearchable={true}
                                    defaultValue={{ value: values.names[index].name, label: values.names[index].name }}
                                    options={mealOptionsDynamic}
                                    //options= {formik.values.diet.map((diet, index) => ({value : diet, label : diet}))}
                                    onChange={(selectedOption) =>
                                        form.setFieldValue(
                                        `names.${index}.name`,
                                        selectedOption.value,
                                        )}
                                />)}
                                </Field>
                                <Field  name={`names.${index}.qty`} className={styles.input_group}/>
                                <ErrorMessage name={`names.${index}.name`} />
                                <ErrorMessage name={`names.${index}.qty`} />
                                <div className="input-button m-2">
                                <button
                                    type="button"
                                    className={styles.button}
                                    onClick={() => arrayHelpers.remove(index)} // remove a name from the list
                                >
                                    Remove input
                                </button>
                                </div>
                            </div>
                            ))}
                            <button
                            type="button"
                            onClick={() => arrayHelpers.push({name: 'recipy1', qty: 1})} // insert an empty string at a position
                        >
                            Add input
                        </button>
                        {/* login buttons */}
                        <div className="input-button">
                            <button type='submit' className={styles.button}>
                                Submit
                            </button>
                        </div>

                        <div className="input-button" >
                        <button type='reset' className={styles.button}>
                            Reset
                        </button>
                    </div>

                        </div>
                    )}
                    />
                    
                    </Form>
                </section>
                </>

            )}
            </Formik>





        </Layout>
        
    )
}