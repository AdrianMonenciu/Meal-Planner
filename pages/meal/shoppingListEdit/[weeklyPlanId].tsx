import Head from 'next/head'
import Link from 'next/link'
import styles from '../../../styles/Form.module.css';
import Image from 'next/image'
import { useEffect, useState, useRef, useId } from 'react';
import { ErrorMessage, Field, FieldArray, Form, Formik, useFormik, useFormikContext } from 'formik';
import router, { useRouter } from 'next/router';
import Layout from "../../../components/layout"
import {dietPreferencesFood} from "../../../lib/dietPreference"
import {foodMeasureUnit} from "../../../lib/foodMeasureUnit"
import * as Yup from "yup";
import { toast } from 'react-toastify';
import { GetServerSideProps } from 'next';
import { Schema } from 'mongoose';
import { IFood } from '../../../models/FoodItem';
import { IMeal } from '../../../models/Meal';
import { IWeeklyPlan } from '../../../models/WeeklyPlan';
import WeeklyPlan from '../../../models/WeeklyPlan';
import Select from 'react-select';
import { authOptions } from "../../api/auth/[...nextauth]"
import { unstable_getServerSession } from 'next-auth';
import type { Session } from "next-auth"
import {DailyInputFieldArray} from '../weeklyPlan-SubForm'
import connectMongo from '../../../database/connectdb'
//import ShoppingList from './weeklyPlan-SubForm'

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

interface IWeklyPlan {
    weeklyPlanData: {
        currentWeeklyPlan: IWeeklyPlan,
        diet: string[],
        userId: string,
        year: number,
    };
}

interface FormValues {
    year: number;
    weekNr: number;
    diet: string[];
    shoppingList: [{ foodItem: string, qty: number, qtyOption: string, isPurchased: boolean }],
    id: string
}


export default function UpdateWeeklyPlan(weeklyPlanProps){
    const [weeklyPlans, setWeeklyPlans] = useState<Service<IWeklyPlan>>({status: 'loading'})

    const formik2Ref = useRef<any>();

    //console.log(mealItemProps.response.payload.results[0])

    let currentWeeklyPlan
    if (weeklyPlanProps.response.status == 'loaded') {
        currentWeeklyPlan = weeklyPlanProps.response.payload.weeklyPlanData.currentWeeklyPlan[0]
        //console.log(currentWeeklyPlan)
    }

    useEffect(() => {
        if(weeklyPlanProps.response.status == 'error') {
            setWeeklyPlans({ status: 'error', error: weeklyPlanProps.response.error})
        } else {
            setWeeklyPlans({ status: 'loaded', payload: weeklyPlanProps.response.payload })
            //console.log(weeklyPlanProps)
            //console.log(weeklyPlanProps.response.payload.weeklyPlanData.currentWeeklyPlan[0])
        }
    },[])

    //console.log(foodItems)
    

    const initialValues: FormValues = {
        year: weeklyPlanProps.response.status == 'loaded' ? weeklyPlanProps.response.payload.weeklyPlanData.year : 0,
        weekNr: weeklyPlanProps.response.status == 'loaded' ? currentWeeklyPlan.weekNr : 0,
        diet: weeklyPlanProps.response.status == 'loaded' ? weeklyPlanProps.response.payload.weeklyPlanData.diet : [''],

        shoppingList: weeklyPlanProps.response.status == 'loaded' ? 
        currentWeeklyPlan.shoppingList.map((list) => ({foodItem: list.foodItem, qty: list.qty, qtyOption: list.qtyOption, isPurchased: list.isPurchased})) 
        : [{ foodItem: '', qty: 0, qtyOption: '', isPurchased: false }],

        id: weeklyPlanProps.response.status == 'loaded' ? currentWeeklyPlan._id : ''
    }
    //console.log(initialValues)


    async function onSubmit(values: FormValues){
        console.log(values)

        const valuesAPI = {
            values: values
        }

        const options = {
            method: "PUT",
            headers : { 'Content-Type': 'application/json'},
            body: JSON.stringify(valuesAPI)
        }

        await fetch('/api/meal/weeklyPlan', options)
        .then(res => res.json())
        .then((data) => {
            console.log(data)
            toast(data.message)
            //if(data) router.push('/')
        })
    }

      
    function generateShoppingList(weeklyPlanValues, setFieldValue) {  //currentAvailableMeals
        const shoppingList = [];
      
        // Add items from snaks for each day
        for (const day of Object.keys(weeklyPlanValues)) {
          if (day.endsWith("Snaks")) {
            const snaks = weeklyPlanValues[day];
            for (const snak of snaks) {
              const existingItem = shoppingList.find((item) => item.foodItem === snak.name);
              if (existingItem) {
                existingItem.qty += snak.qty;
              } else {
                shoppingList.push({ foodItem: snak.name, qty: snak.qty, qtyOption: snak.qtyOption, isPurchased: false });
              }
            }
          }
        }
      
        // Add items from meals for each day
        for (const day of Object.keys(weeklyPlanValues)) {
          if (day.endsWith("Meals")) {
            const meals = weeklyPlanValues[day];
            for (const mealName of meals) {
              const meal = weeklyPlanProps.response.payload.weeklyPlanData.availableMeals.find((m) => m.name === mealName.name);
              if (meal) {
                for (const foodItem of meal.foodItems) {
                  const existingItem = shoppingList.find((item) => item.foodItem === foodItem.foodId.name);
                  if (existingItem) {
                    existingItem.qty += foodItem.qty;
                  } else {
                    shoppingList.push({ foodItem: foodItem.foodId.name, qty: foodItem.qty, qtyOption: foodItem.foodId.foodMeasureUnit, isPurchased: false });
                  }
                }
              }
            }
          }
        }

        // Define the old and new shopping lists
        let oldShoppingList = weeklyPlanValues.shoppingList;
        let newShoppingList = shoppingList;

        newShoppingList.forEach(newItem => {
            let foundItem = oldShoppingList.find(oldItem => oldItem.foodItem === newItem.foodItem);
            if (foundItem) {
                if (foundItem.qty === newItem.qty) {
                    newItem.isPurchased = foundItem.isPurchased;
                }
            }
        })
      
        //console.log(shoppingList)
        console.log(newShoppingList)

        setFieldValue(`shoppingList`, newShoppingList)
        setFieldValue(`shoppingListIsUpdated`, true)
      }
      



    return (
        
        <Layout>

            <Head>
                <title>Weekly Plan</title>
            </Head>

            <section className='flex flex-col justify-evenly gap-10 m-auto bg-slate-50 rounded-md w-10/12 text-center py-4 px-4'> 
                <div className="title">
                    <h1 className='text-gray-800 text-4xl font-bold py-4'>Weekly Plan</h1>
                </div>

                {weeklyPlans.status === 'loading' && <div>Loading...</div>}
                {weeklyPlans.status === 'loaded' &&  (
                    <div className='flex flex-col'>
                    <Formik
                    innerRef={formik2Ref}
                    initialValues={initialValues}
                    onSubmit={onSubmit}
                    >
                    {({ values, handleSubmit, handleChange, errors, resetForm,  setFieldValue, isSubmitting}) => (
                        <>
                        {/*<section className='mx-auto flex flex-col gap-3'>*/}
                            <div className="title">
                                <h1 className='text-gray-800 text-4xl font-bold py-4'>Explore</h1>
                            </div>

                            <Form className='flex flex-col gap-5' onSubmit={handleSubmit}>
                            <p className='w-3/4 mx-auto text-gray-400'>Week number:</p>
                            <Field  name={`weekNr`} className={styles.input_group} readOnly/>
                        
                            <p className='w-3/4 mx-auto text-gray-400'>{`Shopping List`}</p>
                            {values.shoppingList.map((name, index) => ( 
                                <div key={index} className={`${styles.input_group} flex column justify-evenly color to-blue-200 `}>
                                    <Field  name={`shoppingList.${index}.foodItem`} className={styles.input_group} readOnly/>
                                    <Field  name={`shoppingList.${index}.qty`} className={styles.input_group} readOnly/>
                                    <Field  name={`shoppingList.${index}.qtyOption`} className={styles.input_group} readOnly/>
                                    <label> Is puchased: 
                                        <Field  type="checkbox" name={`shoppingList.${index}.isPurchased`} className={styles.input_group}/>
                                    </label>
                                </div>
                            ))}

                            {/* login buttons */}
                            <div className="input-button">
                                <button type='submit' className={styles.button}>
                                    Submit
                                </button>
                            </div>                          
                            
                            </Form>
                        {/*</section>*/}
                        </>

                    )}
                    </Formik>

                    </div>  
                //<pre>{ JSON.stringify(mealItems.payload, null, 2) }</pre>
                //<div>Loaded</div>
                )}

                {weeklyPlans.status === 'error' && (
                    <div>{weeklyPlans.error}</div>
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
    let absoluteUrl = return_url(context);
    const weeklyPlanId = context.params?.weeklyPlanId as string;
    //console.log(`WeeklyPlanId from url querry: ${weeklyPlanId}` )
    let responseLoaded: ServiceLoaded<IWeklyPlan> = {
        status: 'loaded',
        payload: {
            weeklyPlanData: {
                currentWeeklyPlan: undefined,
                diet: [],
                userId: '',
                year: 0,
            }
        }
    }
    
    let responseError
    //console.log(foodNameQuerry)

    async function getWeeklyPlan(weeklyPlanId: string) {
        const options = {
            method: "GET",
            headers : { 'Content-Type': 'application/json'},
        }
        const url = `${absoluteUrl}/api/meal/getWeeklyPlan?weeklyPlanId=${weeklyPlanId}`;

        await fetch(url, options)
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
        .then(data => {responseLoaded.payload.weeklyPlanData.currentWeeklyPlan = data.results
        //console.log(data)
        })
        .catch(err => responseError = { status: 'error', error: "Error getting the Weekly Plan!"});
        
    }

      

    const sessionObj: Session | null = await unstable_getServerSession(context.req, context.res, authOptions)
    const userDietPreference: string[] = sessionObj?.user.dietPreference

    connectMongo()

    if (!userDietPreference) {
        responseError = { status: 'error', error: "Error getting the user's diet preferences!"}
    } else {
        responseLoaded.status = 'loaded' 
        responseLoaded.payload.weeklyPlanData.diet = userDietPreference
        responseLoaded.payload.weeklyPlanData.userId = sessionObj.user._id
        responseLoaded.payload.weeklyPlanData.year = new Date().getFullYear()
        //console.log(userDietPreference)
        //console.log(nonExistingWeeks)

        await getWeeklyPlan(weeklyPlanId)
    }

    
    if (responseError) {
        //console.log(responseError)
        return {
            props: { response: responseError },
        }
    }

    //console.log(responseLoaded)
    
    return {
        props: {response: responseLoaded}
    }
  }