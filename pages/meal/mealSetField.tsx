import Head from 'next/head'
import Layout_login from '../../layout_login/layout_login'
import Link from 'next/link'
import styles from '../../styles/Form.module.css';
import { Image } from "cloudinary-react";
import { HiAtSymbol, HiFingerPrint, HiOutlineUser } from "react-icons/hi";
import { useEffect, useId, useRef, useState } from 'react';
import { ErrorMessage, Field, FieldArray, Form, Formik, useFormik, useFormikContext } from 'formik';
import { registerValidate } from '../../lib/validate'
import router, { useRouter } from 'next/router';
import Layout from "../../components/layout"
import {dietPreferencesFood} from "../../lib/dietPreference"
import {foodMeasureUnit} from "../../lib/foodMeasureUnit"
import * as Yup from "yup";
import { toast } from 'react-toastify';
import Select from 'react-select';
import { IFood } from '../../models/FoodItem';
import {useSession } from "next-auth/react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';

async function uploadImage(
    image: File | string
    ) {
    const url = 'https://api.cloudinary.com/v1_1/' + process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME + '/image/upload';

    const formData = new FormData();
    formData.append('file', image);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_PRESET);

    const response = await fetch(url, {
        method: 'post',
        body: formData,
        mode: 'cors'
    }).then(r => r.json());

    return response;
}

export default function Register(){
    const instanceId = useId();

    const formik2Ref = useRef<any>();  

    const mealOptions = [
        { value: "", label: "" },
    ];

    const { data: session, status } = useSession()

    const [availableFoodItems, setavailableFoodItems] = useState(mealOptions)
    const [currentDietPlan, setCurrentDietPlan] = useState([])
    const [currentFoodItemsData, setCurrentFoodItemsData] = useState<IFood[]>() //<IFood[]>
    const [dietPlanUpdated, setdietPlanUpdated] = useState<boolean>(true)
    const [previewImage, setPreviewImage] = useState<string>()
    
    
    interface IfoodItems {
        qty: number, 
        name: string,
        qtyOption: string,
        id: string, 
        image?: File | string;
    }

    interface FormValues2 {
        foodItems: IfoodItems[];
        foodItems2: IfoodItems[];
    }

    const initialValues2: FormValues2 = {
        //foodItems: [{name: '', qty: 0, qtyOption: 'Quantity', id: '', image: null}],
        foodItems: [],
        foodItems2: []
    }
    
    const validationSchema2 = Yup.object().shape({
        foodItems: Yup.array().required().min(2, 'Min 2 food items required!').max(10, 'Maximum 10 food items are allowed!').of(
        Yup.object().shape({
            name: Yup.string().required(),
            qty: Yup.number().required().min(0.1, 'Min qty is 0.1')
        }))
    });
    
    async function onSubmit2(values: FormValues2){
        console.log(values)
        console.log(formik.values)

        interface IMeal_api_body {
            name: string;
            diet: string[];
            privateBool: boolean;
            privateAllFoods: boolean;
            image?: File | string;
            foodItems: {
                foodId: string,
                qty: number
            }[]
        }

        const response = await uploadImage(formik.values.image)

        if (response.public_id) {
            const meal_api_body: IMeal_api_body = {
                name: formik.values.name.charAt(0).toUpperCase() + formik.values.name.slice(1).toLowerCase(), //formik.values.name
                diet: currentDietPlan,
                privateBool: privateMeal, 
                privateAllFoods: allPrivateFoodItems,
                image: response.public_id as string,
                foodItems: values.foodItems.map(({id, qty}) => ({foodId: id, qty: qty}))
            }

            console.log(meal_api_body)

            const options = {
                method: "POST",
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
        } else {
            toast('Image could not be uploaded.')
        }

    }


    interface FormValues {
        name: string;
        diet: string[];
        privateBool: boolean;
        allPrivateFoodItems: boolean;
        image?: File | string;
    }

    const initialValues: FormValues = {
        name : '',
        diet: [],
        privateBool: session ? (session.user.userRole == "admin" ? false : true) : true,
        allPrivateFoodItems: false,
        image: null
    }

    const [privateMeal, setPrivateMeal] = useState<boolean>(initialValues.privateBool)
    const [allPrivateFoodItems, setAllPrivateFoodItems] = useState<boolean>(false)
    //const [resetAvailableFood, setResetAvailableFood] = useState<boolean>(false)

    const SUPPORTED_FORMATS: string[] = ['image/jpg', 'image/png', 'image/jpeg', 'image/gif'];

    const validationSchemaYup: Yup.SchemaOf<FormValues> = Yup.object().shape({
        name: Yup.string().required('Item name required').min(2, "The name must have at least 2 characters!")
        .max(20, "The name must have maximum 20 characters!")
        .test("Empty space", "Name can not start with SPACE!", function(value) {if (value) return  !(value.charAt(0) === " "); else return true }),
        diet: Yup.array(Yup.string()).min(1, 'Select at least 1 diet oprion!'),
        privateBool: Yup.bool().required(),
        allPrivateFoodItems: Yup.bool().required(),
        image: Yup.mixed().nullable().required('Image is required!').test('size', 'File size is too big',
        (value) => value && value.size <= 1024 * 1024 // 5MB
           ).test('type','Invalid file format selection',
           (value) =>
          !value || (value && SUPPORTED_FORMATS.includes(value?.type))
           )
    });
   
    const formik = useFormik({
        initialValues: initialValues,
        //validate: registerValidate,
        validationSchema: validationSchemaYup,
        onSubmit: onSubmit1
    })

    const FoodSelect = ({ setFieldValue, parentValues}) => {
        const [name, setName] = useState('Please select a food item!')
        const [qty, setQty] = useState<any>(0)
        const [qtyOption, setQtyOption] = useState('')
        const [id, setId] = useState('')
        const [image, setImage] = useState(null)
        const [error, setError] = useState({name: '', qty: ''})
        const [touched, setTouched] = useState({name: false, qty: false})
        const [mealType, setMealType] = useState("Please select a Meal Type!")

        const options = [
            { value: 'foodItems', label: 'foodItems' },
            { value: 'foodItems2', label: 'foodItems2' }
          ];          

        function updateQtyOptionAndIdSelect (selectedOption) {
            //setFieldValue("fullName", `${values.firstName} ${values.lastName}`);
            const currentFoodItem = currentFoodItemsData.find(food => food.name === selectedOption)
            //console.log(currentFoodItem)
    
            setQtyOption(currentFoodItem.foodMeasureUnit)
            setId(currentFoodItem._id as unknown as string)
            setImage(currentFoodItem.image)
        };

        const checkError = (updatedName, updatedQty, touchedName, touchedQty) => {
            var nameError, qtyError: string
            if(updatedName == "Please select a food item!" && touchedName) {
                nameError = "Please select a food item!"
            } else {
                nameError = ""
            } 
            
            if (updatedQty <= 0 && touchedQty) {
                qtyError = "Quantity needs to be bigger than 0!"
            } else {
                qtyError = ""
            }
            setError({name: nameError, qty: qtyError})
        }

        const addNewField = () => {
            // interface FormValues2 {
            //     foodItems: IfoodItems[];
            // }
        
            // const initialValues2: FormValues2 = {
            //     //foodItems: [{name: '', qty: 0, qtyOption: 'Quantity', id: '', image: null}],
            //     foodItems: []
            // }
            const currentArray = parentValues[mealType];
            const updatedArray = [...currentArray];
            updatedArray.push({name: name, qty: qty, qtyOption: qtyOption, id: id, image: image});
            setFieldValue(mealType, updatedArray); //"foodItems"
            //setFieldValue
            //arrayHelpers.push({name: name, qty: qty, qtyOption: qtyOption, id: id, image: image}); // Add a new field to the array
        };
          
        const customStyles = {
            control: (provided) => ({
              ...provided,
              borderRadius: '0.375rem',
              '@media (max-width: 767px)': {
                height: '30px',
              },
              '@media (min-width: 768px)': {
                height: '40px',
              },
            }),
        };

        return (
            <div className={`flex flex-col w-full min-h-[72px] bg-green-100 border rounded-xl`}>
                <div className='flex flex-row justify-between w-full mt-2 mb-2 items-center '>
                    <div className='w-16 h-16 ml-1 md:ml-2 flex items-center justify-center'>
                        {image ?
                            <Image
                                className={`${styles.avatar_medium} border-2 flex justify-start`}
                                cloudName={process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}
                                publicId={image}
                                alt={image ? image as string : ''} 
                                secure
                                dpr="auto"
                                quality="auto"
                                width={350}
                                height={350}
                                crop="fill"
                                gravity="auto" 
                            />
                            : <div className='text-center'>No Image</div>
                        }
                    </div>
                    
                    <div className='flex flex-wrap max-w-[245px] md:max-w-none  gap-2 md:flex-row md:gap-4'>
                        <Select
                            className="w-60 mb-0.5 md:mb-0 items-center md:w-80 text-sm md:text-base"
                            //classNamePrefix="select-box"
                            styles={customStyles}
                            instanceId={instanceId}
                            isSearchable={true}
                            isDisabled={availableFoodItems[0].label == ''}
                            value={{ value: name, label: name }}
                            //defaultValue={{ value: values.names[index].name, label: values.names[index].name }}
                            options={
                                //availableFoodItems
                                availableFoodItems.filter(item => {
                                    for (let i = 0; i < parentValues.foodItems.length; i++) {
                                        if (item.value == parentValues.foodItems[i].name) {
                                            //console.log(`curent av food: ${item.value},  current value: ${values.foodItems[i].name}`)
                                            return false;
                                        }
                                    }
                                    return true;
                                })
                            }
                            //options= {formik.values.diet.map((diet, index) => ({value : diet, label : diet}))}
                            onChange={(selectedOption) => { 
                                setName(selectedOption.value)
                                updateQtyOptionAndIdSelect(selectedOption.value)
                                checkError(selectedOption.value, qty, true, touched.qty)  
                                setTouched({name: true, qty: touched.qty})
                                }}
                        />

                        <Select
                            className="w-60 mb-0.5 md:mb-0 items-center md:w-80 text-sm md:text-base"
                            //classNamePrefix="select-box"
                            styles={customStyles}
                            instanceId={instanceId}
                            isSearchable={true}
                            isDisabled={availableFoodItems[0].label == ''}
                            value={{ value: mealType, label: mealType }}
                            //defaultValue={{ value: values.names[index].name, label: values.names[index].name }}
                            options={options}
                            //options= {formik.values.diet.map((diet, index) => ({value : diet, label : diet}))}
                            onChange={(selectedOption) => { 
                                setMealType(selectedOption.value)
                                }}
                        />

                        <div className='flex items-center justify-between w-[159px] md:w-48 border rounded-lg h-8 md:h-10 bg-white text-sm md:text-base'>
                            <input type='number' name='qty' className='w-20 md:w-24 rounded-lg h-full pl-2' disabled={availableFoodItems[0].label === ''} value={qty} 
                            onChange={(e) => {setQty(Number(e.target.value)) ; 
                            checkError(name, Number(e.target.value), touched.name, true); setTouched({name: touched.name, qty: true})}} 
                            onKeyDown={(e) => {
                                if (e.key === 'Backspace' && qty >=-9 && qty <=9) {
                                setQty('');
                                }
                            }}
                            />
                            <div className='ml-2 mr-2 flex items-center justify-center h-full'>{'['}{qtyOption}{']'}</div>
                        </div>

                        <div className="min-w-[10px] mr-1 md:mr-2">
                            <button
                            type="button"
                            className={`${styles.button} whitespace-nowrap`}
                            onClick={() => { if(name != "Please select a food item!" && qty > 0) {
                                addNewField()
                                setName("Please select a food item!")
                                setImage("") 
                                setQty(0)
                                setQtyOption("")
                                setError({name: "", qty: ""})
                                setTouched({name: false, qty: false})
                                checkError(name, qty, false, false)
                                } else {
                                    setTouched({name: true, qty: true})
                                    checkError(name, qty, true, true)
                                    console.log(`name:${name} and qty: ${qty}`)
                                }}
                            }
                            >
                                <span className=" ml-1 mr-1 md:ml-4 md:mr-4">Add Food</span>
                            </button>

                        </div>
                    </div>

                </div>

                <div className='flex ml-4'>
                    <span className={`text-rose-500 mr-5 text-sm md:text-base ${error.name || error.qty ? "mb-1" : ""}`}>
                    {`${error.name} ${error.name != "" ? " " : ""} ${error.qty}`}
                    </span>
                </div>
                
            </div>                        
        );
    };

    useEffect(() => {
        //console.log(formik.values.diet);
        const idietArraysEqual = JSON.stringify(formik.values.diet) === JSON.stringify(currentDietPlan);
        setdietPlanUpdated(idietArraysEqual);
    }, [formik.values.diet, currentDietPlan]);

    useEffect(() => {
        //console.log(`formik.values.privateBool:${formik.values.privateBool}, privateMeal:${privateMeal}, formik.values.allPrivateFoodItems:${formik.values.allPrivateFoodItems}, allPrivateFoodItems:${allPrivateFoodItems}`)
        if(formik.values.privateBool != privateMeal || formik.values.allPrivateFoodItems != allPrivateFoodItems) {
            setdietPlanUpdated(false)
        } else {
            setdietPlanUpdated(true)
        }
    }, [formik.values.privateBool, privateMeal, formik.values.allPrivateFoodItems, allPrivateFoodItems]);

    async function onSubmit1(values: FormValues){
        await getFoodItems(values.diet)

        // const foodNames = foodArray.filter(item => {
        //     for (let i = 0; i < values.diet.length; i++) {
        //       if (item.diet.includes(values.diet[i].toLowerCase())) {
        //         return true;
        //       }
        //     }
        //     return false;
        // }).map(item => item.foodName);

        setCurrentDietPlan(values.diet.map((food) => food));
        setPrivateMeal(values.privateBool)
        setAllPrivateFoodItems(values.allPrivateFoodItems)

        formik2Ref.current.resetForm();
    }

    async function getFoodItems(querryData: string[]) {
        const options = {
          method: "GET",
          headers : { 'Content-Type': 'application/json'},
        }
        const encodedDiets = encodeURIComponent(querryData.join(',')) // encodeURIComponent(querryData.join(','))
        const url = `/api/meal/getFoodItemsByDiet?diets=${encodedDiets}&isPrivate=${formik.values.privateBool}&privateAll=${formik.values.allPrivateFoodItems}&username=${session.user.username}`;

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
        console.log(currentFoodItemsData)
    },[currentFoodItemsData])
      
    const ErrorDisplay = ({ error }) => {
        if (typeof error === 'string') {
          return <div>{error}</div>;
        }
      
        return null;
    };


    return (
        
        <Layout>

            <Head>
                <title>Add Meal</title>
            </Head>

            <section className='min-w-[250px] max-w-[320px] md:max-w-[900px] items-center mx-auto flex flex-col gap-3 mt-4 md:mt-8'> 
                <div className="flex justify-start">
                    <h1 className='font-bold md:text-xl'>Add Meal</h1>
                </div>

                {/* form flex flex-col md:flex-row */}
                <form className='grid grid-cols-1 md:grid-cols-2 md:grid-rows-1 md:gap-x-10 gap-5' onSubmit={formik.handleSubmit}>
                    <div className='flex flex-col gap-5 md:col-start-1 md:row-start-1'>
                        <div className='flex flex-col'>
                            <div className={`${styles.input_group} ${formik.errors.name && formik.touched.name ? 'border-rose-600' : ''}`}>
                                <input 
                                type="text"
                                name='Name'
                                placeholder='Meal name'
                                className={styles.input_text}
                                {...formik.getFieldProps('name')}
                                />
                            </div>
                            {formik.errors.name && formik.touched.name ? 
                                <span className={`${styles.formikError}`}>{formik.errors.name}</span> : <></>}
                            {/* {formik.errors.username && formik.touched.username ? <span className='text-rose-500'>{formik.errors.username}</span> : <></>} */}
                        </div>

                        <div className={`${styles.input_group} flex-col bg-green-100 
                        ${formik.errors.diet && formik.touched.diet ? 'border-rose-600' : ''}`}>
                            <div className={`text-left ml-3 mt-1 font-medium text-sm md:text-base ${currentDietPlan.length == 0 ? 'mb-1' : ''} font-bold`}> Current Diet: </div>
                            <div className='flex flex-col mb-1'>
                                {currentDietPlan.map((diet) => <span key={diet} className='mr-3 ml-3 text-sm md:text-base'> {diet} </span>)}
                            </div>
                            <div className='text-left ml-3 mt-2 mb-1 font-medium text-sm md:text-base' id="checkbox-group">Select Dietary suitability:</div>
                            <div className={`flex flex-col mb-1`} role="group" aria-labelledby="checkbox-group">
                                {dietPreferencesFood.map((diet) => 
                                <label className={`mr-3 ml-3 mt-1 ${(!currentDietPlan.includes(diet) && (formik.values.diet.indexOf(diet) > -1)) ? 'text-rose-500' : ''} text-sm md:text-base`} key={diet}>
                                    <input className='mr-1' type="checkbox" name="diet" {...formik.getFieldProps('diet')} value={diet} 
                                    checked={(formik.values.diet.indexOf(diet) > -1) ? true : false}
                                    /> {/* defaultChecked={(formik.values.diet.indexOf(diet) > -1) ? true : false}   */}
                                {diet} </label>)}
                            </div>
                            {formik.errors.diet && formik.touched.diet ? 
                            <span className='text-rose-500 mb-1 ml-1 text-sm md:text-base'>{formik.errors.diet}</span> : <></>}

                            <div className=" mt-1 min-w-[120px] max-w-[200px] mx-auto mb-1">
                                <button type='submit' disabled={dietPlanUpdated}
                                className={`${styles.button_no_bg} py-1 bg-gradient-to-r
                                ${ dietPlanUpdated ? 'from-green-400 to-green-500' : ' from-red-500 to-red-600'}`}>
                                    <span className="px-1 md:px-2">
                                    {dietPlanUpdated ? 'Food items Updated' : 'Reset Food Items'}</span>
                                </button>
                            </div>
                        </div>

                    </div>


                    <div className='flex flex-col gap-5 md:col-start-2 md:row-start-1'> 
                        <div className={`${styles.input_group} flex-col w-full bg-green-100`}>
                            <div className={`text-left ml-3 mt-1 text-sm md:text-base mb-1 font-medium`}>{`${!privateMeal ? "Public Meal" : 
                            (allPrivateFoodItems ? "Private Meal - Include all private Food Items" : "Private Meal - Include diet match Food Items")}`}</div>
                            <label className={`mr-3 ml-3 mt-1 text-sm md:text-base 
                            ${(formik.values.privateBool == true && formik.values.privateBool != privateMeal) ? 'text-rose-500' : ''}`}>
                                <input type="radio" name="privateBool" className='mr-1' checked={formik.values.privateBool === true}
                                disabled={session ? (session.user.userRole == "admin" ? false : true) : true}
                                onChange={() => formik.setFieldValue("privateBool", true)}
                                />
                                Private Meal
                            </label>
                            <label className={`mr-3 ml-3 mt-1 mb-1 text-sm md:text-base
                            ${(formik.values.privateBool == false && formik.values.privateBool != privateMeal) ? 'text-rose-500' : ''}`}>
                                <input type="radio" name="privateBool" className='mr-1' checked={formik.values.privateBool === false}
                                disabled={session ? (session.user.userRole == "admin" ? false : true) : true}
                                onChange={() => formik.setFieldValue("privateBool", false)}
                                />
                                Public Meal
                            </label>
                            <label className={`mr-3 ml-3 mt-3 text-sm md:text-base
                            ${(formik.values.privateBool && formik.values.allPrivateFoodItems == true && formik.values.allPrivateFoodItems != allPrivateFoodItems) ? 'text-rose-500' : ''}`}>
                                <input type="radio" name="allPrivateFoodItems" className='mr-1' 
                                checked={formik.values.privateBool ? formik.values.allPrivateFoodItems === true : false}
                                disabled={!formik.values.privateBool}
                                onChange={() => formik.setFieldValue("allPrivateFoodItems", true)}
                                />
                                Include all private Food Items
                            </label>
                            <label className={`mr-3 ml-3 mt-1 mb-1 text-sm md:text-base
                            ${(formik.values.privateBool && formik.values.allPrivateFoodItems == false && formik.values.allPrivateFoodItems != allPrivateFoodItems) ? 'text-rose-500' : ''}`}>
                                <input type="radio" name="allPrivateFoodItems" className='mr-1' 
                                checked={formik.values.privateBool ?  formik.values.allPrivateFoodItems === false : false}
                                disabled={!formik.values.privateBool}
                                onChange={() => formik.setFieldValue("allPrivateFoodItems", false)}
                                />
                                Include private Food Items matching diet
                            </label>
                            <div className=" mt-1 min-w-[120px] max-w-[200px] mx-auto mb-1">
                                <button type='submit' disabled={dietPlanUpdated}
                                className={`${styles.button_no_bg} py-1 bg-gradient-to-r
                                ${ dietPlanUpdated ? 'from-green-400 to-green-500' : ' from-red-500 to-red-600'}`}>
                                    <span className="px-1 md:px-2">
                                    {dietPlanUpdated ? 'Food items Updated' : 'Reset Food Items'}</span>
                                </button>
                            </div>
                            {/* <div>{`Private: ${formik.values.private}`}</div> */}
                        </div>

                        <div className='flex items-center flex-col gap-5'>
                            <div className='flex flex-col'>
                                <label htmlFor="image" className={`${styles.button} w-full min-w-[120px] max-w-[200px] text-center`}>
                                    <span className={`px-1 md:px-2`}>Choose Image File</span>
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
                                <span className='text-rose-500 mt-1 ml-3 text-sm md:text-base'>{formik.errors.image}</span> : <></>}
                            </div>

                            <div>
                                {formik.values.image ?
                                    <>  
                                        <img
                                        src={previewImage}
                                        className={`${styles.avatar} `}
                                        />
                                    </>
                                    : "No Image"
                                }
                            </div>
                        </div>

                    </div>                   
   
                </form>

                <Formik
                innerRef={formik2Ref}
                initialValues={initialValues2}
                onSubmit={onSubmit2}
                validationSchema={validationSchema2}
                >
                {({ values, handleSubmit, handleChange, errors, touched, resetForm,  setFieldValue, setTouched}) => (
                    <>
                    
                    <section className='mx-auto w-[320px] md:w-[750px] flex flex-col gap-3 mt-3'>
                        <div className="title">
                            <p className='w-3/4 ml-2 font-bold'>Meal ingredients:</p>
                        </div>

                        <Form className='w-full flex flex-col  ' onSubmit={handleSubmit}>
                        <FieldArray
                        name="foodItems"
                        render={arrayHelpers => (
                            <div className='w-full flex flex-col '>
                            {values.foodItems.map((name, index) => (
                                <div key={index} className={`flex flex-col  w-full ${index < values.foodItems.length - 1 ? 'mb-4' : ''}`}>
                                    {/*<Field name={`names.${index}`} className={styles.input_group}/>*/}
                                    

                                    <div className={`flex flex-row items-center `}>
                                        <div className='w-16 h-16 ml-1 md:ml-2 flex items-center justify-center'>
                                            {values.foodItems[index].image ?
                                                <Image
                                                    className={`${styles.avatar_medium} border-2 flex justify-start`}
                                                    cloudName={process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}
                                                    publicId={values.foodItems[index].image}
                                                    alt={values.foodItems[index].image ? values.foodItems[index].image as string : ''} 
                                                    secure
                                                    dpr="auto"
                                                    quality="auto"
                                                    width={350}
                                                    height={350}
                                                    crop="fill"
                                                    gravity="auto" 
                                                />
                                                : <div className='text-center'>No Image</div>
                                            }
                                        </div>
                                        
                                        <div className='flex flex-wrap ml-2 max-w-[245px] md:max-w-none  gap-2 md:flex-row md:gap-4'>
                                            <div className="flex items-center overflow-hidden pl-2 w-60 mb-0.5 md:mb-0 md:w-80 text-sm md:text-base border rounded-lg h-8 md:h-10 bg-white">
                                                <p className="text-center whitespace-nowrap truncate">{values.foodItems[index].name}</p>
                                            </div>

                                            <div className='flex items-center justify-between w-[159px] md:w-48 border rounded-lg h-8 md:h-10 bg-white text-sm md:text-base'>
                                                <Field  type='number' name={`foodItems.${index}.qty`} className={`w-20 md:w-24 rounded-lg h-full pl-2`}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setFieldValue(`foodItems.${index}.qty`, value !== '' ? Number(value) : null); // Convert to number or set to null
                                                  }}
                                                />
                                                <div className='ml-2 mr-2 flex items-center justify-center h-full'>{'['}{values.foodItems[index].qtyOption}{']'}</div>
                                            </div>

                                            <div className="min-w-[10px] ml-3 md:ml-0 mr-1 md:mr-2">
                                                <button
                                                type="button"
                                                className={`${styles.button_no_bg} py-1 whitespace-nowrap bg-gradient-to-r from-red-500 to-red-600`}
                                                onClick={() => arrayHelpers.remove(index)}
                                                >
                                                    <span className=" ml-1 mr-1 md:ml-4 md:mr-4">Remove</span>
                                                </button>

                                            </div>

                                        </div>
                                    </div>
                                
                                    <div className={`text-rose-500 mr-5 text-left text-sm md:text-base ml-20 mt-1 md:mt-0 mb-1`}>
                                        <ErrorMessage name={`foodItems[${index}].qty`} component="div"/>
                                    </div>
                                    
                                </div>
                            ))}

                            <div className={`text-rose-500 mr-5 text-sm md:text-base mt-1 md:mt-2 ml-2 mb-1`}>
                                <ErrorMessage name="foodItems">
                                    {(error) => <ErrorDisplay error={error} />}
                                </ErrorMessage>
                            </div>              

                            

                        </div>
                        )}
                        />

                        <FieldArray
                        name="foodItems2"
                        render={arrayHelpers => (
                            <div className='w-full flex flex-col '>
                                <div className="title">
                                    <p className='w-3/4 ml-2 font-bold'>Meal ingredients 2:</p>
                                </div>
                            {values.foodItems2.map((name, index) => (
                                <div key={index} className={`flex flex-col  w-full ${index < values.foodItems2.length - 1 ? 'mb-4' : ''}`}>
                                    {/*<Field name={`names.${index}`} className={styles.input_group}/>*/}
                                    

                                    <div className={`flex flex-row items-center `}>
                                        <div className='w-16 h-16 ml-1 md:ml-2 flex items-center justify-center'>
                                            {values.foodItems2[index].image ?
                                                <Image
                                                    className={`${styles.avatar_medium} border-2 flex justify-start`}
                                                    cloudName={process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}
                                                    publicId={values.foodItems2[index].image}
                                                    alt={values.foodItems2[index].image ? values.foodItems2[index].image as string : ''} 
                                                    secure
                                                    dpr="auto"
                                                    quality="auto"
                                                    width={350}
                                                    height={350}
                                                    crop="fill"
                                                    gravity="auto" 
                                                />
                                                : <div className='text-center'>No Image</div>
                                            }
                                        </div>
                                        
                                        <div className='flex flex-wrap ml-2 max-w-[245px] md:max-w-none  gap-2 md:flex-row md:gap-4'>
                                            <div className="flex items-center overflow-hidden pl-2 w-60 mb-0.5 md:mb-0 md:w-80 text-sm md:text-base border rounded-lg h-8 md:h-10 bg-white">
                                                <p className="text-center whitespace-nowrap truncate">{values.foodItems2[index].name}</p>
                                            </div>

                                            <div className='flex items-center justify-between w-[159px] md:w-48 border rounded-lg h-8 md:h-10 bg-white text-sm md:text-base'>
                                                <Field  type='number' name={`foodItems2.${index}.qty`} className={`w-20 md:w-24 rounded-lg h-full pl-2`}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setFieldValue(`foodItems2.${index}.qty`, value !== '' ? Number(value) : null); // Convert to number or set to null
                                                  }}
                                                />
                                                <div className='ml-2 mr-2 flex items-center justify-center h-full'>{'['}{values.foodItems2[index].qtyOption}{']'}</div>
                                            </div>

                                            <div className="min-w-[10px] ml-3 md:ml-0 mr-1 md:mr-2">
                                                <button
                                                type="button"
                                                className={`${styles.button_no_bg} py-1 whitespace-nowrap bg-gradient-to-r from-red-500 to-red-600`}
                                                onClick={() => arrayHelpers.remove(index)}
                                                >
                                                    <span className=" ml-1 mr-1 md:ml-4 md:mr-4">Remove</span>
                                                </button>

                                            </div>

                                        </div>
                                    </div>
                                
                                    <div className={`text-rose-500 mr-5 text-left text-sm md:text-base ml-20 mt-1 md:mt-0 mb-1`}>
                                        <ErrorMessage name={`foodItems2[${index}].qty`} component="div"/>
                                    </div>
                                    
                                </div>
                            ))}

                            <div className={`text-rose-500 mr-5 text-sm md:text-base mt-1 md:mt-2 ml-2 mb-1`}>
                                <ErrorMessage name="foodItems2">
                                    {(error) => <ErrorDisplay error={error} />}
                                </ErrorMessage>
                            </div>              

                            

                        </div>
                        )}
                        />

                            <div className='mt-3'>
                                <FoodSelect setFieldValue={setFieldValue}  parentValues={values}/>
                            </div>

                            <div className="min-w-[10px] mt-3 flex justify-center">
                                <button type='submit' className={`${styles.button} max-w-[100px] `}>
                                    Add Meal
                                </button>
                            </div>
                        
                        </Form>
                    </section>
                    </>

                )}
                </Formik>


            </section>

        </Layout>
        
    )

}