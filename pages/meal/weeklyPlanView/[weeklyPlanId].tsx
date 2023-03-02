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
import {DailyInputFieldArrayView} from '../weeklyPlan-SubForm'
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
        availableFoodItems: IFood[],
        availableMeals: IMeal[],
        diet: string[],
        availableWeekNumbers: number[],
        foodItemsSelectOptions: IfoodAndMealsOptions[],
        mealsSelectOptions: IfoodAndMealsOptions[],
        userId: string,
        year: number,
    };
}

interface IfoodItemsForm {
    qty: number, 
    name: string,
    qtyOption: string,
    id: string
}

interface IMealsForm { 
    name: string,
    id: string
}

interface IfoodAndMealsOptions {
    value: string,
    label: string
}

interface FormValues {
    year: number;
    weekNr: number;
    diet: string[];
    mondayMeals: IMealsForm[],
    mondaySnaks: IfoodItemsForm[],
    tuesdayMeals: IMealsForm[],
    tuesdaySnaks: IfoodItemsForm[],
    wednesdayMeals: IMealsForm[],
    wednesdaySnaks: IfoodItemsForm[],
    thursdayMeals: IMealsForm[],
    thursdaySnaks: IfoodItemsForm[],
    fridayMeals: IMealsForm[],
    fridaySnaks: IfoodItemsForm[],
    saturdayMeals: IMealsForm[],
    saturdaySnaks: IfoodItemsForm[],
    sundayMeals: IMealsForm[],
    sundaySnaks: IfoodItemsForm[],
    shoppingList: [{ foodItem: string, qty: number, qtyOption: string, isPurchased: boolean }],
    shoppingListIsUpdated: boolean
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

        mondayMeals: weeklyPlanProps.response.status == 'loaded' ? 
        currentWeeklyPlan.mondayMeals.map((meal) => ({name: meal.name, id: meal._id})) 
        : [{name: '', id: ''}],

        mondaySnaks: weeklyPlanProps.response.status == 'loaded' ? 
        currentWeeklyPlan.mondaySnaks.map((snack) => ({name: snack.foodId.name, qty: snack.qty, qtyOption: snack.foodId.foodMeasureUnit, id: snack.foodId._id})) 
        : [{name: '', qty: 0, qtyOption: '', id: ''}],

        tuesdayMeals: weeklyPlanProps.response.status == 'loaded' ? 
        currentWeeklyPlan.tuesdayMeals.map((meal) => ({name: meal.name, id: meal._id})) 
        : [{name: '', id: ''}],

        tuesdaySnaks: weeklyPlanProps.response.status == 'loaded' ? 
        currentWeeklyPlan.tuesdaySnaks.map((snack) => ({name: snack.foodId.name, qty: snack.qty, qtyOption: snack.foodId.foodMeasureUnit, id: snack.foodId._id})) 
        : [{name: '', qty: 0, qtyOption: '', id: ''}],

        wednesdayMeals: weeklyPlanProps.response.status == 'loaded' ? 
        currentWeeklyPlan.wednesdayMeals.map((meal) => ({name: meal.name, id: meal._id})) 
        : [{name: '', id: ''}],

        wednesdaySnaks: weeklyPlanProps.response.status == 'loaded' ? 
        currentWeeklyPlan.wednesdaySnaks.map((snack) => ({name: snack.foodId.name, qty: snack.qty, qtyOption: snack.foodId.foodMeasureUnit, id: snack.foodId._id})) 
        : [{name: '', qty: 0, qtyOption: '', id: ''}],

        thursdayMeals: weeklyPlanProps.response.status == 'loaded' ? 
        currentWeeklyPlan.thursdayMeals.map((meal) => ({name: meal.name, id: meal._id})) 
        : [{name: '', id: ''}],

        thursdaySnaks: weeklyPlanProps.response.status == 'loaded' ? 
        currentWeeklyPlan.thursdaySnaks.map((snack) => ({name: snack.foodId.name, qty: snack.qty, qtyOption: snack.foodId.foodMeasureUnit, id: snack.foodId._id})) 
        : [{name: '', qty: 0, qtyOption: '', id: ''}],

        fridayMeals: weeklyPlanProps.response.status == 'loaded' ? 
        currentWeeklyPlan.fridayMeals.map((meal) => ({name: meal.name, id: meal._id})) 
        : [{name: '', id: ''}],

        fridaySnaks: weeklyPlanProps.response.status == 'loaded' ? 
        currentWeeklyPlan.fridaySnaks.map((snack) => ({name: snack.foodId.name, qty: snack.qty, qtyOption: snack.foodId.foodMeasureUnit, id: snack.foodId._id})) 
        : [{name: '', qty: 0, qtyOption: '', id: ''}],

        saturdayMeals: weeklyPlanProps.response.status == 'loaded' ? 
        currentWeeklyPlan.saturdayMeals.map((meal) => ({name: meal.name, id: meal._id})) 
        : [{name: '', id: ''}],

        saturdaySnaks: weeklyPlanProps.response.status == 'loaded' ? 
        currentWeeklyPlan.saturdaySnaks.map((snack) => ({name: snack.foodId.name, qty: snack.qty, qtyOption: snack.foodId.foodMeasureUnit, id: snack.foodId._id})) 
        : [{name: '', qty: 0, qtyOption: '', id: ''}],

        sundayMeals: weeklyPlanProps.response.status == 'loaded' ? 
        currentWeeklyPlan.sundayMeals.map((meal) => ({name: meal.name, id: meal._id})) 
        : [{name: '', id: ''}],

        sundaySnaks: weeklyPlanProps.response.status == 'loaded' ? 
        currentWeeklyPlan.sundaySnaks.map((snack) => ({name: snack.foodId.name, qty: snack.qty, qtyOption: snack.foodId.foodMeasureUnit, id: snack.foodId._id})) 
        : [{name: '', qty: 0, qtyOption: '', id: ''}],

        shoppingList: weeklyPlanProps.response.status == 'loaded' ? 
        currentWeeklyPlan.shoppingList.map((list) => ({foodItem: list.foodItem, qty: list.qty, qtyOption: list.qtyOption, isPurchased: list.isPurchased})) 
        : [{ foodItem: '', qty: 0, qtyOption: '', isPurchased: false }],

        shoppingListIsUpdated: true,
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
                            <DailyInputFieldArrayView values={values} weeklyPlanProps={weeklyPlanProps} fieldName="monday" />
                            <DailyInputFieldArrayView values={values} weeklyPlanProps={weeklyPlanProps} fieldName="tuesday" />
                            <DailyInputFieldArrayView values={values} weeklyPlanProps={weeklyPlanProps} fieldName="wednesday" />
                            <DailyInputFieldArrayView values={values} weeklyPlanProps={weeklyPlanProps} fieldName="thursday" />
                            <DailyInputFieldArrayView values={values} weeklyPlanProps={weeklyPlanProps} fieldName="friday" />
                            <DailyInputFieldArrayView values={values} weeklyPlanProps={weeklyPlanProps} fieldName="saturday" />
                            <DailyInputFieldArrayView values={values} weeklyPlanProps={weeklyPlanProps} fieldName="sunday" />

                            <p className='w-3/4 mx-auto text-gray-400'>{`Shopping List`}</p>
                            {values.shoppingList.map((name, index) => ( 
                                <div key={index} className={`${styles.input_group} flex column justify-evenly color to-blue-200 `}>
                                    <Field  name={`shoppingList.${index}.foodItem`} className={styles.input_group} readOnly/>
                                    <Field  name={`shoppingList.${index}.qty`} className={styles.input_group} readOnly/>
                                    <Field  name={`shoppingList.${index}.qtyOption`} className={styles.input_group} readOnly/>
                                    <label> Is puchased: 
                                        <Field  type="checkbox" name={`shoppingList.${index}.isPurchased`} className={styles.input_group} disabled={true}/>
                                    </label>
                                </div>
                            ))}
                   
                            
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
                availableFoodItems: [], 
                availableMeals: [], 
                diet: [],
                availableWeekNumbers: [], 
                foodItemsSelectOptions: [], 
                mealsSelectOptions: [],
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

    async function getFoodItems(querryData: string[]) {
        const options = {
          method: "GET",
          headers : { 'Content-Type': 'application/json'},
        }
        const encodedDiets = encodeURIComponent(querryData.join(',')) // encodeURIComponent(querryData.join(','))
        const url = `${absoluteUrl}/api/meal/getFoodItemsByDiet?diets=${encodedDiets}`;
        //console.log(url)

        await fetch(url, options).then(async (response) => {
          if (!response.ok) {
            const error = await response.json()
            //console.log(error)
            throw new Error(error)
          } else {
            return response.json()
          }
        }).then(data => {
        responseLoaded.status = 'loaded' 
        responseLoaded.payload.weeklyPlanData.availableFoodItems = data
        //console.log(data)
        })
        .catch(err => responseError = { status: 'error', error: "Error getting the food Items!"});
    }

    async function getMeals(querryData: string[]) {
        const options = {
            method: "GET",
            headers : { 'Content-Type': 'application/json'},
        }
        const encodedMeals = encodeURIComponent(querryData.join(',')) // encodeURIComponent(querryData.join(','))
        const url = `${absoluteUrl}/api/meal/getMeals?diets=${encodedMeals}`;

        await fetch(url, options)
        .then(async (response) => {
        if (!response.ok) {
            const error = await response.json()
            //console.log(error)
            throw new Error(error)
        } else {
            return response.json()
        }
        })
        .then(data => {
            responseLoaded.status = 'loaded' 
            responseLoaded.payload.weeklyPlanData.availableMeals = data.results})
        .catch(err => responseError = { status: 'error', error: `Error getting the Meals! ${err}`});
    }

    function getWeekNr() {
        const now: Date = new Date();
        const onejan: Date = new Date(now.getFullYear(), 0, 1);
        const weekNumber: number = Math.ceil((((now.valueOf() - onejan.valueOf()) / 86400000) + onejan.getDay() + 1) / 7) ?? 0;
 
        return weekNumber;
    }
      
    const currentWeekNr = getWeekNr();
    // console.log(currentWeekNr)
    const weeksToCheck = [currentWeekNr, currentWeekNr + 1, currentWeekNr + 2, currentWeekNr + 3];
    //const nonExistingWeekNumbers = nonExistingWeeks.map(weekNr => weekNr.toString());


    const sessionObj: Session | null = await unstable_getServerSession(context.req, context.res, authOptions)
    const userDietPreference: string[] = sessionObj?.user.dietPreference
    const currentYear=  new Date().getFullYear()
    connectMongo()
    const existingWeeks = await WeeklyPlan.distinct('weekNr', { //owner: String(sessionObj.user._id), year: currentYear,
        weekNr: { $in: weeksToCheck } });
    //console.log(existingWeeks)
    const nonExistingWeeks = weeksToCheck.filter(weekNr => !existingWeeks.includes(weekNr));

    if (!userDietPreference) {
        responseError = { status: 'error', error: "Error getting the user's diet preferences!"}
    } else {
        responseLoaded.status = 'loaded' 
        responseLoaded.payload.weeklyPlanData.availableWeekNumbers = nonExistingWeeks
        responseLoaded.payload.weeklyPlanData.diet = userDietPreference
        responseLoaded.payload.weeklyPlanData.userId = sessionObj.user._id
        responseLoaded.payload.weeklyPlanData.year = new Date().getFullYear()
        //console.log(userDietPreference)
        //console.log(nonExistingWeeks)

        await getFoodItems(userDietPreference)
        await getMeals(userDietPreference)
        await getWeeklyPlan(weeklyPlanId)

        const foodNames = responseLoaded.payload.weeklyPlanData.availableFoodItems != undefined ? 
        responseLoaded.payload.weeklyPlanData.availableFoodItems.map(item => item.name) : [""];
        responseLoaded.payload.weeklyPlanData.foodItemsSelectOptions = foodNames.map((food) => ({value : food, label : food}))

        const mealNames = responseLoaded.payload.weeklyPlanData.availableMeals != undefined ? 
        responseLoaded.payload.weeklyPlanData.availableMeals.map(item => item.name) : [""];
        responseLoaded.payload.weeklyPlanData.mealsSelectOptions = mealNames.map((meal) => ({value : meal, label : meal}))
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