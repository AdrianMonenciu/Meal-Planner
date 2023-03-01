import Head from 'next/head'
import Layout_login from '../../layout_login/layout_login'
import Link from 'next/link'
import styles from '../../styles/Form.module.css';
import Image from 'next/image'
import { useEffect, useState, useRef, useId } from 'react';
import { ErrorMessage, Field, FieldArray, Form, Formik, useFormik, useFormikContext } from 'formik';
import router, { useRouter } from 'next/router';
import Layout from "../../components/layout"
import {dietPreferencesFood} from "../../lib/dietPreference"
import {foodMeasureUnit} from "../../lib/foodMeasureUnit"
import * as Yup from "yup";
import { toast } from 'react-toastify';
import { GetServerSideProps } from 'next';
import { Schema } from 'mongoose';
import { IFood } from '../../models/FoodItem';
import { IMeal } from '../../models/Meal';
import WeeklyPlan from '../../models/WeeklyPlan';
import Select from 'react-select';
import { authOptions } from "../api/auth/[...nextauth]"
import { unstable_getServerSession } from 'next-auth';
import type { Session } from "next-auth"
import {DailyInputFieldArray} from './weeklyPlan-SubForm'
import connectMongo from '../../database/connectdb'
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
        availableFoodItems: IFood[],
        availableMeals: IMeal[],
        diet: string[],
        availableWeekNumbers: number[],
        foodItemsSelectOptions: IfoodAndMealsOptions[],
        mealsSelectOptions: IfoodAndMealsOptions[],
        userId: string,
        year: number
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
}

interface IfoodItemsDataBase {
    qty: number, 
    id: string
}

interface IMealsDataBase { 
    id: string
}

interface IweeklyPlan_api_body {
    year: number;
    weekNr: number;
    diet: string[];
    mondayMeals: IMealsDataBase[],
    mondaySnaks: IfoodItemsDataBase[],
    tuesdayMeals: IMealsDataBase[],
    tuesdaySnaks: IfoodItemsDataBase[],
    wednesdayMeals: IMealsDataBase[],
    wednesdaySnaks: IfoodItemsDataBase[],
    thursdayMeals: IMealsDataBase[],
    thursdaySnaks: IfoodItemsDataBase[],
    fridayMeals: IMealsDataBase[],
    fridaySnaks: IfoodItemsDataBase[],
    saturdayMeals: IMealsDataBase[],
    saturdaySnaks: IfoodItemsDataBase[],
    sundayMeals: IMealsDataBase[],
    sundaySnaks: IfoodItemsDataBase[],
    shoppingList: [{ foodItem: string, qty: number, qtyOption: string, isPurchased: boolean }]
}



export default function UpdateFood(weeklyPlanProps){
    const [mealItems, setMealItems] = useState<Service<IWeklyPlan>>({status: 'loading'})

    const formik2Ref = useRef<any>();

    //console.log(mealItemProps.response.payload.results[0])

    useEffect(() => {
        if(weeklyPlanProps.response.status == 'error') {
            setMealItems({ status: 'error', error: weeklyPlanProps.response.error})
        } else {
            setMealItems({ status: 'loaded', payload: weeklyPlanProps.response.payload })
            console.log(weeklyPlanProps)
        }
    },[])

    //console.log(foodItems)
    


    const initialValues: FormValues = {
        year: weeklyPlanProps.response.status == 'loaded' ? weeklyPlanProps.response.payload.weeklyPlanData.year : 0,
        weekNr: weeklyPlanProps.response.status == 'loaded' ? weeklyPlanProps.response.payload.weeklyPlanData.availableWeekNumbers[0] : 0,
        diet: weeklyPlanProps.response.status == 'loaded' ? weeklyPlanProps.response.payload.weeklyPlanData.diet : [''],
        mondayMeals: [{name: '', id: ''}],
        mondaySnaks: [{name: '', qty: 0, qtyOption: '', id: ''}],
        tuesdayMeals: [{name: '', id: ''}],
        tuesdaySnaks: [{name: '', qty: 0, qtyOption: '', id: ''}],
        wednesdayMeals: [{name: '', id: ''}],
        wednesdaySnaks: [{name: '', qty: 0, qtyOption: '', id: ''}],
        thursdayMeals: [{name: '', id: ''}],
        thursdaySnaks: [{name: '', qty: 0, qtyOption: '', id: ''}],
        fridayMeals: [{name: '', id: ''}],
        fridaySnaks: [{name: '', qty: 0, qtyOption: '', id: ''}],
        saturdayMeals: [{name: '', id: ''}],
        saturdaySnaks: [{name: '', qty: 0, qtyOption: '', id: ''}],
        sundayMeals: [{name: '', id: ''}],
        sundaySnaks: [{name: '', qty: 0, qtyOption: '', id: ''}],
        shoppingList: [{ foodItem: '', qty: 0, qtyOption: '', isPurchased: false }],
        shoppingListIsUpdated: false
    }

    const validationSchema = Yup.object().shape({
        mondayMeals: Yup.array().required().max(5, 'Maximum 5 meals are allowed!').of(
            Yup.object().shape({
                name: Yup.string().required('Name field is required')
        })),
        mondaySnaks: Yup.array().required().max(10, 'Maximum 10 snacks are allowed!').of(
            Yup.object().shape({
                name: Yup.string().required(),
                qty: Yup.number().required().min(0.1, 'Min qty is 0.1')
        })),
        tuesdayMeals: Yup.array().required().max(5, 'Maximum 5 meals are allowed!').of(
            Yup.object().shape({
                name: Yup.string().required('Name field is required')
        })),
        tuesdaySnaks: Yup.array().required().max(10, 'Maximum 10 snacks are allowed!').of(
            Yup.object().shape({
                name: Yup.string().required(),
                qty: Yup.number().required().min(0.1, 'Min qty is 0.1')
        })),
        wednesdayMeals: Yup.array().required().max(5, 'Maximum 5 meals are allowed!').of(
            Yup.object().shape({
                name: Yup.string().required('Name field is required')
        })),
        wednesdaySnaks: Yup.array().required().max(10, 'Maximum 10 snacks are allowed!').of(
            Yup.object().shape({
                name: Yup.string().required(),
                qty: Yup.number().required().min(0.1, 'Min qty is 0.1')
        })),
        thursdayMeals: Yup.array().required().max(5, 'Maximum 5 meals are allowed!').of(
            Yup.object().shape({
                name: Yup.string().required('Name field is required')
        })),
        thursdaySnaks: Yup.array().required().max(10, 'Maximum 10 snacks are allowed!').of(
            Yup.object().shape({
                name: Yup.string().required(),
                qty: Yup.number().required().min(0.1, 'Min qty is 0.1')
        })),
        fridayMeals: Yup.array().required().max(5, 'Maximum 5 meals are allowed!').of(
            Yup.object().shape({
                name: Yup.string().required('Name field is required')
        })),
        fridaySnaks: Yup.array().required().max(10, 'Maximum 10 snacks are allowed!').of(
            Yup.object().shape({
                name: Yup.string().required(),
                qty: Yup.number().required().min(0.1, 'Min qty is 0.1')
        })),
        saturdayMeals: Yup.array().required().max(5, 'Maximum 5 meals are allowed!').of(
            Yup.object().shape({
                name: Yup.string().required('Name field is required')
        })),
        saturdaySnaks: Yup.array().required().max(10, 'Maximum 10 snacks are allowed!').of(
            Yup.object().shape({
                name: Yup.string().required(),
                qty: Yup.number().required().min(0.1, 'Min qty is 0.1')
        })),
        sundayMeals: Yup.array().required().max(5, 'Maximum 5 meals are allowed!').of(
            Yup.object().shape({
                name: Yup.string().required('Name field is required')
        })),
        sundaySnaks: Yup.array().required().max(10, 'Maximum 10 snacks are allowed!').of(
            Yup.object().shape({
                name: Yup.string().required(),
                qty: Yup.number().required().min(0.1, 'Min qty is 0.1')
        }))
    });



    async function onSubmit(values: FormValues){
        console.log(values)

        const valuesAPI = {
            values: values
        }

        const options = {
            method: "POST",
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

                {mealItems.status === 'loading' && <div>Loading...</div>}
                {mealItems.status === 'loaded' &&  (
                    <div className='flex flex-col'>
                    <Formik
                    innerRef={formik2Ref}
                    initialValues={initialValues}
                    onSubmit={onSubmit}
                    validationSchema={validationSchema}
                    >
                    {({ values, handleSubmit, handleChange, errors, resetForm,  setFieldValue, isSubmitting}) => (
                        <>
                        {/*<section className='mx-auto flex flex-col gap-3'>*/}
                            <div className="title">
                                <h1 className='text-gray-800 text-4xl font-bold py-4'>Explore</h1>
                            </div>

                            <Form className='flex flex-col gap-5' onSubmit={handleSubmit}>
                            <p className='w-3/4 mx-auto text-gray-400'>Week number:</p>
                            <Field name={`weekNr`}>
                                {({ field, form }) => (
                                <Select
                                    className="select-wrap w-500"
                                    classNamePrefix="select-box"
                                    instanceId={useId()}
                                    isSearchable={true}
                                    value={{ value: values.weekNr, label: values.weekNr }}
                                    //defaultValue={{ value: values.names[index].name, label: values.names[index].name }}
                                    options={
                                        weeklyPlanProps.response.payload.weeklyPlanData.availableWeekNumbers.map((week) => ({value : week, label : week}))
                                    }
                                    //options= {formik.values.diet.map((diet, index) => ({value : diet, label : diet}))}
                                    onChange={(selectedOption) => { 
                                        form.setFieldValue(`weekNr`, selectedOption.value,)}
                                    }
                                />)}
                            </Field>
                            <DailyInputFieldArray values={values} weeklyPlanProps={weeklyPlanProps} setFieldValue={setFieldValue} fieldName="monday" />
                            <DailyInputFieldArray values={values} weeklyPlanProps={weeklyPlanProps} setFieldValue={setFieldValue} fieldName="tuesday" />
                            <DailyInputFieldArray values={values} weeklyPlanProps={weeklyPlanProps} setFieldValue={setFieldValue} fieldName="wednesday" />
                            <DailyInputFieldArray values={values} weeklyPlanProps={weeklyPlanProps} setFieldValue={setFieldValue} fieldName="thursday" />
                            <DailyInputFieldArray values={values} weeklyPlanProps={weeklyPlanProps} setFieldValue={setFieldValue} fieldName="friday" />
                            <DailyInputFieldArray values={values} weeklyPlanProps={weeklyPlanProps} setFieldValue={setFieldValue} fieldName="saturday" />
                            <DailyInputFieldArray values={values} weeklyPlanProps={weeklyPlanProps} setFieldValue={setFieldValue} fieldName="sunday" />

                            <div className="input-button m-2">
                                <button
                                    type="button"
                                    className={styles.button}
                                    onClick={() => generateShoppingList(values, setFieldValue)}
                                >
                                    Update Shopping List
                                </button>
                                </div>

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
                            {!values.shoppingListIsUpdated ? <div>Please update the shopping list before submitting!</div> : <></>}
                            <div className="input-button">
                                <button type='submit' className={styles.button} disabled={!values.shoppingListIsUpdated}>
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
    let absoluteUrl = return_url(context);
    //const mealNameQuerry = context.params?.meal;
    let responseLoaded: ServiceLoaded<IWeklyPlan> = {
        status: 'loaded',
        payload: {
            weeklyPlanData: {
                availableFoodItems: [], 
                availableMeals: [], 
                diet: [],
                availableWeekNumbers: [], 
                foodItemsSelectOptions: [], 
                mealsSelectOptions: [],
                userId: '',
                year: 0
            }
        }
    }
    
    let responseError
    //console.log(foodNameQuerry)

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
    const existingWeeks = await WeeklyPlan.distinct('weekNr', { owner: String(sessionObj.user._id), year: currentYear,
        weekNr: { $in: weeksToCheck } });
    //console.log(existingWeeks)
    const nonExistingWeeks = weeksToCheck.filter(weekNr => !existingWeeks.includes(weekNr));

    if (!userDietPreference) {
        responseError = { status: 'error', error: "Error getting the user's diet preferences!"}
    }else if (nonExistingWeeks.length == 0) {
        responseError = { status: 'error', error: "Week plan created for all available weeks!"}
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