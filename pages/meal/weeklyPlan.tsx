import Head from 'next/head'
import Layout_login from '../../layout_login/layout_login'
import Link from 'next/link'
import styles from '../../styles/Form.module.css';
import Image from 'next/image'
import { HiAtSymbol, HiFingerPrint, HiOutlineUser } from "react-icons/hi";
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
    shoppingList: [{ foodItem: string, qty: number, isPurchased: boolean }]
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
    shoppingList: [{ foodItem: string, qty: number, isPurchased: boolean }]
}



export default function UpdateFood(weeklyPlanProps){
    const [mealItems, setMealItems] = useState<Service<IWeklyPlan>>({status: 'loading'})

    const formik2Ref = useRef<any>();

    const mealOptions = [
        { value: "", label: "" }, 
    ];

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
        shoppingList: [{ foodItem: '', qty: 0, isPurchased: false }]
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
        }))
    });



    async function onSubmit(values: FormValues){
        //formik2Ref.current.resetForm();
        // formik2Ref.current.setValues(
        //     {foodItems: [{name: '', qty: 0, qtyOption: 'Quantity', id: ''}]}
        // )
        console.log(values)
    }

    // async function onSubmit2(values: FormValues2){
    //     //console.log(values)
    //     //console.log(formik.values)

    //     interface IMeal_api_body {
    //         //name: string;
    //         diet: string[];
    //         foodItems: {
    //             foodId: string,
    //             qty: number
    //         }[];
    //         id: Schema.Types.ObjectId
    //     }

    //     const meal_api_body: IMeal_api_body = {
    //         //name: values.name,
    //         diet: currentDietPlan,
    //         foodItems: values.foodItems.map(({id, qty}) => ({foodId: id, qty: qty})),
    //         id: mealItemProps.response.payload.results[0]._id
    //     }

    //     console.log(meal_api_body)

    //     const options = {
    //         method: "PUT",
    //         headers : { 'Content-Type': 'application/json'},
    //         body: JSON.stringify(meal_api_body)
    //     }

    //     await fetch('/api/meal/meal', options)
    //     .then(res => res.json())
    //     .then((data) => {
    //         console.log(data)
    //         toast(data.message)
    //         //if(data) router.push('/')
    //     })
    // }





    function updateQtyOptionAndId (index, selectedOption, setFieldValue, currentField: string) {
        //setFieldValue("fullName", `${values.firstName} ${values.lastName}`);
        const currentFoodItem = weeklyPlanProps.response.payload.weeklyPlanData.availableFoodItems.find(food => food.name === selectedOption)
        //console.log(currentFoodItem)
        setFieldValue(`${currentField}.${index}.qtyOption`, currentFoodItem.foodMeasureUnit)
        setFieldValue(`${currentField}.${index}.id`, currentFoodItem._id)
    };

    function updateId (index, selectedOption, setFieldValue, currentField: string) {
        //setFieldValue("fullName", `${values.firstName} ${values.lastName}`);
        const currentMeal = weeklyPlanProps.response.payload.weeklyPlanData.availableMeals.find(food => food.name === selectedOption)
        //console.log(currentFoodItem)
        setFieldValue(`${currentField}.${index}.id`, currentMeal._id)
    };
      


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
                    {({ values, handleSubmit, handleChange, errors, resetForm,  setFieldValue}) => (
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
                                        //availableFoodItems
                                        weeklyPlanProps.response.payload.weeklyPlanData.availableWeekNumbers.map((week) => ({value : week, label : week}))
                                    }
                                    //options= {formik.values.diet.map((diet, index) => ({value : diet, label : diet}))}
                                    onChange={(selectedOption) => { 
                                        form.setFieldValue(`weekNr`, selectedOption.value,)}
                                    }
                                />)}
                                </Field>
                            <FieldArray name="mondayMeals" 
                            render={arrayHelpers => (
                                <div>
                                    <p className='w-3/4 mx-auto text-gray-400'>Monday Meals</p>
                                {values.mondayMeals.map((name, index) => (
                                    <div key={index} className={`${styles.input_group} flex column justify-evenly color to-blue-200 `}>
                                        {/*<Field name={`names.${index}`} className={styles.input_group}/>*/}
                                        <Field name={`mondayMeals[${index}].name`}>
                                        {({ field, form }) => (
                                        <Select
                                            className="select-wrap w-500"
                                            classNamePrefix="select-box"
                                            instanceId={useId()}
                                            isSearchable={true}
                                            value={{ value: values.mondayMeals[index].name, label: values.mondayMeals[index].name }}
                                            //defaultValue={{ value: values.names[index].name, label: values.names[index].name }}
                                            options={
                                                //availableFoodItems
                                                weeklyPlanProps.response.payload.weeklyPlanData.mealsSelectOptions.filter(item => {
                                                    for (let i = 0; i < values.mondayMeals.length; i++) {
                                                        if (item.value == values.mondayMeals[i].name) {
                                                            //console.log(`curent av food: ${item.value},  current value: ${values.foodItems[i].name}`)
                                                            return false;
                                                        }
                                                    }
                                                    return true;
                                                })
                                            }
                                            //options= {formik.values.diet.map((diet, index) => ({value : diet, label : diet}))}
                                            onChange={(selectedOption) => { 
                                                form.setFieldValue(`mondayMeals.${index}.name`, selectedOption.value,)
                                                //form.setFieldValue(`names.${index}.qtyOption`, 'Qty')
                                                updateId(index, selectedOption.value, setFieldValue, 'mondayMeals')
                                                }}
                                        />)}
                                        </Field>

                                        <ErrorMessage name={`mondayMeals.${index}.name`} />
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
                                onClick={() => arrayHelpers.push({name: '', id: ''})} // insert an empty string at a position
                                >
                                    Add input
                                </button>
                            </div>
                            )}
                            />

                            <FieldArray
                            name="mondaySnaks"
                            render={arrayHelpers => (
                                <div>
                                    <p className='w-3/4 mx-auto text-gray-400'>Monday Snacks</p>
                                {values.mondaySnaks.map((name, index) => (
                                    <div key={index} className={`${styles.input_group} flex column justify-evenly color to-blue-200 `}>
                                        {/*<Field name={`names.${index}`} className={styles.input_group}/>*/}
                                        <Field name={`mondaySnaks[${index}].name`}>
                                        {({ field, form }) => (
                                        <Select
                                            className="select-wrap w-500"
                                            classNamePrefix="select-box"
                                            instanceId={useId()}
                                            isSearchable={true}
                                            value={{ value: values.mondaySnaks[index].name, label: values.mondaySnaks[index].name }}
                                            //defaultValue={{ value: values.names[index].name, label: values.names[index].name }}
                                            options={
                                                //availableFoodItems
                                                weeklyPlanProps.response.payload.weeklyPlanData.foodItemsSelectOptions.filter(item => {
                                                    for (let i = 0; i < values.mondaySnaks.length; i++) {
                                                        if (item.value == values.mondaySnaks[i].name) {
                                                            //console.log(`curent av food: ${item.value},  current value: ${values.foodItems[i].name}`)
                                                            return false;
                                                        }
                                                    }
                                                    return true;
                                                })
                                            }
                                            //options= {formik.values.diet.map((diet, index) => ({value : diet, label : diet}))}
                                            onChange={(selectedOption) => { 
                                                form.setFieldValue(`mondaySnaks.${index}.name`, selectedOption.value,)
                                                //form.setFieldValue(`names.${index}.qtyOption`, 'Qty')
                                                updateQtyOptionAndId(index, selectedOption.value, setFieldValue, `mondaySnaks`)
                                                }}
                                        />)}
                                        </Field>
                                        <Field  type='number' name={`mondaySnaks.${index}.qty`} className={styles.input_group} 
                                        />
                                        <Field  name={`mondaySnaks.${index}.qtyOption`} className={styles.input_group} readOnly/>
                                        <ErrorMessage name={`mondaySnaks.${index}.name`} />
                                        <ErrorMessage name={`mondaySnaks.${index}.qty`} />
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
                            </div>
                            )}
                            />

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

    function getWeekNr(date) {
        const firstDayOfYear: any = new Date(date.getFullYear(), 0, 1);
        const daysSinceFirstDayOfYear = (date - firstDayOfYear) / 86400000; // 86400000 = number of milliseconds in a day
        const weekNr = Math.ceil((daysSinceFirstDayOfYear + firstDayOfYear.getDay() + 1) / 7);
        return weekNr;
    }
      
    const currentWeekNr = getWeekNr(new Date());
    const weeksToCheck = [currentWeekNr, currentWeekNr + 1, currentWeekNr + 2, currentWeekNr + 3];
    //const nonExistingWeekNumbers = nonExistingWeeks.map(weekNr => weekNr.toString());


    const sessionObj: Session | null = await unstable_getServerSession(context.req, context.res, authOptions)
    const userDietPreference: string[] = sessionObj?.user.dietPreference

    if (!userDietPreference) {
        responseError = { status: 'error', error: "Error getting the user's diet preferences!"}
    } else {
        const existingWeeks = await WeeklyPlan.distinct('weekNr', { _id: String(sessionObj.user._id), year:  new Date().getFullYear(), 
            weekNr: { $in: weeksToCheck } });
        const nonExistingWeeks = weeksToCheck.filter(weekNr => !existingWeeks.includes(weekNr));
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