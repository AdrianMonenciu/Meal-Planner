import Head from 'next/head'
import Layout_login from '../../../layout_login/layout_login'
import Link from 'next/link'
import styles from '../../../styles/Form.module.css';
import Image from 'next/image'
import { HiAtSymbol, HiFingerPrint, HiOutlineUser } from "react-icons/hi";
import { useEffect, useState, useRef, useId } from 'react';
import { ErrorMessage, Field, FieldArray, Form, Formik, useFormik, useFormikContext } from 'formik';
import { registerValidate } from '../../../lib/validate'
import router, { useRouter } from 'next/router';
import Layout from "../../../components/layout"
import {dietPreferencesFood} from "../../../lib/dietPreference"
import {foodMeasureUnit} from "../../../lib/foodMeasureUnit"
import * as Yup from "yup";
import { toast } from 'react-toastify';
import { GetServerSideProps } from 'next';
import { IMeal } from '../../../models/Meal';
import { Schema } from 'mongoose';
import { IFood } from '../../../models/FoodItem';
import Select from 'react-select';

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

interface IMeals {
    results: IMeal;
}

export default function UpdateFood(mealItemProps){
    const [mealItems, setMealItems] = useState<Service<IMeals>>({status: 'loading'})

    const formik2Ref = useRef<any>();

    const mealOptions = [
        { value: "", label: "" },
    ];

    const [availableFoodItems, setavailableFoodItems] = useState(mealOptions)
    const [currentDietPlan, setCurrentDietPlan] = useState([''])
    const [currentFoodItemsData, setCurrentFoodItemsData] = useState<IFood[]>() //<IFood[]>

    //console.log(mealItemProps.response.payload.results[0])

    useEffect(() => {
        if(mealItemProps.response.status == 'error') {
            setMealItems({ status: 'error', error: mealItemProps.response.error})
        } else {
            setMealItems({ status: 'loaded', payload: mealItemProps.response.payload })
            //console.log(foodItemProps)
        }
        setCurrentDietPlan(mealItemProps.response.payload.results[0].diet)
        getFoodItems(mealItemProps.response.payload.results[0].diet)
    },[])

    //console.log(foodItems)
    
    interface FormValues {
        name: string;
        diet: string[];
    }

    interface IfoodItems {
        qty: number, 
        name: string,
        qtyOption: string,
        id: string
    }

    interface FormValues2 {
        foodItems: IfoodItems[];
    }

    const initialValues: FormValues = {
        name : mealItemProps.response.status == 'loaded' ? mealItemProps.response.payload.results[0].name : '',
        diet: mealItemProps.response.status == 'loaded' ? mealItemProps.response.payload.results[0].diet : [],
    }

    const initialValues2: FormValues2 = {
        foodItems: mealItemProps.response.status == 'loaded' ? mealItemProps.response.payload.results[0].foodItems.map(foodItem => ({
            name: foodItem.foodId.name,
            qty: foodItem.qty,
            qtyOption: foodItem.foodId.foodMeasureUnit,
            id: foodItem.foodId._id
        })) : [{name: '', qty: 0, qtyOption: 'Quantity', id: ''}],
        //foodItems: [{name: '', qty: 0, qtyOption: 'Quantity', id: ''}],
    }

    const validationSchemaYup: Yup.SchemaOf<FormValues> = Yup.object().shape({
        name: Yup.string().required('Item name required').min(2, "The name must have at least 2 characters!")
        .max(20, "The name must have maximum 20 characters!")
        .test("Empty space", "Name can not start with SPACE!", function(value) {if (value) return  !(value.charAt(0) === " "); else return true }),
        diet: Yup.array(Yup.string()).min(1, 'Select at least 1 diet oprion!')
    });

    const validationSchema2 = Yup.object().shape({
        foodItems: Yup.array().required().max(10, 'Maximum 10 food items are allowed!').of(
        Yup.object().shape({
            name: Yup.string().max(10).required(),
            qty: Yup.number().required().min(0.1, 'Min qty is 0.1')
        })
        )
    });


    const formik = useFormik({
        initialValues: initialValues,
        //validate: registerValidate,
        validationSchema: validationSchemaYup,
        onSubmit: onSubmit1
    })


    async function onSubmit1(values: FormValues){
        await getFoodItems(values.diet)
        setCurrentDietPlan(values.diet.map((food) => food));
        //formik2Ref.current.resetForm();
        formik2Ref.current.setValues(
            {foodItems: [{name: '', qty: 0, qtyOption: 'Quantity', id: ''}]}
        )
    }

    async function onSubmit2(values: FormValues2){
        //console.log(values)
        //console.log(formik.values)

        interface IMeal_api_body {
            name: string;
            diet: string[];
            foodItems: {
                foodId: string,
                qty: number
            }[];
            id: Schema.Types.ObjectId
        }

        const meal_api_body: IMeal_api_body = {
            name: formik.values.name,
            diet: currentDietPlan,
            foodItems: values.foodItems.map(({id, qty}) => ({foodId: id, qty: qty})),
            id: mealItemProps.response.payload.results[0]._id
        }

        console.log(meal_api_body)

        const options = {
            method: "PUT",
            headers : { 'Content-Type': 'application/json'},
            body: JSON.stringify(meal_api_body)
        }

        await fetch('/api/meal/meal', options)
        .then(res => res.json())
        .then((data) => {
            console.log(data)
            toast(data.message)
            //if(data) router.push('/')
        })
    }





    function updateQtyOptionAndId (index, selectedOption, setFieldValue) {
        //setFieldValue("fullName", `${values.firstName} ${values.lastName}`);
        const currentFoodItem = currentFoodItemsData.find(food => food.name === selectedOption)
        //console.log(currentFoodItem)
        setFieldValue(`foodItems.${index}.qtyOption`, currentFoodItem.foodMeasureUnit)
        setFieldValue(`foodItems.${index}.id`, currentFoodItem._id)
    };

    async function getFoodItems(querryData: string[]) {
        const options = {
          method: "GET",
          headers : { 'Content-Type': 'application/json'},
        }
        const encodedDiets = encodeURIComponent(querryData.join(',')) // encodeURIComponent(querryData.join(','))
        const url = `/api/meal/getFoodItemsByDiet?diets=${encodedDiets}`;
        //console.log(url)

        await fetch(url, options)
        .then(async (response) => {
          if (!response.ok) {
            const error = await response.json()
            //console.log(error)
            throw new Error(error)
          } else {
            return response.json()
          }
        }).then(data => {
        setCurrentFoodItemsData(data)
        //console.log(currentFoodItemsData)
        })
        .catch(err => toast.error(err));
    }

    useEffect(() => {
        const foodNames = currentFoodItemsData != undefined ? currentFoodItemsData.map(item => item.name) : [""];
        setavailableFoodItems(foodNames.map((food) => ({value : food, label : food})));
        //console.log(currentFoodItemsData)
    },[currentFoodItemsData])
      


    return (
        
        <Layout>

            <Head>
                <title>Update Food Item</title>
            </Head>

            <section className='flex flex-col justify-evenly gap-10 m-auto bg-slate-50 rounded-md w-10/12 text-center py-4 px-4'> 
                <div className="title">
                    <h1 className='text-gray-800 text-4xl font-bold py-4'>Update Meal Item</h1>
                </div>

                {mealItems.status === 'loading' && <div>Loading...</div>}
                {mealItems.status === 'loaded' &&  (
                    <>
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
                    
                    <div className='mx-4'>Current Diet: {currentDietPlan.map((diet) => `${diet} `)}</div>
                 
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
                            Update diet plan
                        </button>
                    </div>
                    </form>



                    <Formik
                    innerRef={formik2Ref}
                    initialValues={initialValues2}
                    onSubmit={onSubmit2}
                    validationSchema={validationSchema2}
                    >
                    {({ values, handleSubmit, handleChange, errors, resetForm,  setFieldValue}) => (
                        <>
                        <Head>
                            <title>DynamicInput</title>
                        </Head>

                        <section className='mx-auto flex flex-col gap-3'>
                            <div className="title">
                                <h1 className='text-gray-800 text-4xl font-bold py-4'>Explore</h1>
                                <p className='w-3/4 mx-auto text-gray-400'>Description text goes here.</p>
                            </div>

                            <Form className='flex gap-5' onSubmit={handleSubmit}>
                            <FieldArray
                            name="foodItems"
                            render={arrayHelpers => (
                                <div>
                                {values.foodItems.map((name, index) => (
                                    <div key={index} className={`${styles.input_group} flex column justify-evenly color to-blue-200 `}>
                                        {/*<Field name={`names.${index}`} className={styles.input_group}/>*/}
                                        <Field name={`foodItems[${index}].name`}>
                                        {({ field, form }) => (
                                        <Select
                                            className="select-wrap w-500"
                                            classNamePrefix="select-box"
                                            instanceId={useId()}
                                            isSearchable={true}
                                            value={{ value: values.foodItems[index].name, label: values.foodItems[index].name }}
                                            //defaultValue={{ value: values.names[index].name, label: values.names[index].name }}
                                            options={
                                                //availableFoodItems
                                                availableFoodItems.filter(item => {
                                                    for (let i = 0; i < values.foodItems.length; i++) {
                                                        if (item.value == values.foodItems[i].name) {
                                                            //console.log(`curent av food: ${item.value},  current value: ${values.foodItems[i].name}`)
                                                            return false;
                                                        }
                                                    }
                                                    return true;
                                                })
                                            }
                                            //options= {formik.values.diet.map((diet, index) => ({value : diet, label : diet}))}
                                            onChange={(selectedOption) => { 
                                                form.setFieldValue(`foodItems.${index}.name`, selectedOption.value,)
                                                //form.setFieldValue(`names.${index}.qtyOption`, 'Qty')
                                                updateQtyOptionAndId(index, selectedOption.value, setFieldValue)
                                                }}
                                        />)}
                                        </Field>
                                        <Field  type='number' name={`foodItems.${index}.qty`} className={styles.input_group} 
                                        />
                                        <Field  name={`foodItems.${index}.qtyOption`} className={styles.input_group} readOnly/>
                                        <ErrorMessage name={`foodItems.${index}.name`} />
                                        <ErrorMessage name={`foodItems.${index}.qty`} />
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
                                onClick={() => arrayHelpers.push({name: '', qty: 0, qtyOption: '', id: ''})} // insert an empty string at a position
                                >
                                    Add input
                                </button>
                                {/* login buttons */}
                                <div className="input-button">
                                    <button type='submit' className={styles.button}>
                                        Submit
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

                    </>
                )}

                {mealItems.status === 'error' && (
                    <div>{mealItems.error}</div>
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
    const mealNameQuerry = context.params?.meal;
    let responseLoaded, responseError

    //console.log(foodNameQuerry)

    const options = {
        method: "GET",
        headers : { 'Content-Type': 'application/json'},
      }
      await fetch(`${url}/api/meal/getMeals?mealName=${mealNameQuerry}&limit=1`, options)
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