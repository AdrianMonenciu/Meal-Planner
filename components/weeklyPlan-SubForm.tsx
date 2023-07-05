import styles from '../styles/Form.module.css';
import { useState, useId } from 'react';
import { ErrorMessage, Field, FieldArray} from 'formik';
import Select from 'react-select';
import React from 'react';
import { Image } from "cloudinary-react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

export const DailyInputFieldArray = ({ values, weeklyPlanProps, setFieldValue,  fieldName, errors, touched }) => {
    const fieldNameUpper = fieldName ? fieldName.charAt(0).toUpperCase() + fieldName.slice(1).toLowerCase() : '';
    const fieldNameMealBreakfast = fieldName ? fieldName + "MealsBreakfast" : 'MondayMeals';
    const fieldNameMealLunch = fieldName + "MealsLunch";
    const fieldNameMealDinner = fieldName + "MealsDinner";
    const fieldNameSnaks = fieldName ? fieldName + "Snaks" : 'MondaySnaks';
    const instanceId = useId();

    const ErrorDisplay = ({ error }) => {
        if (typeof error === 'string') {
          return <div>{error}</div>;
        }
      
        return null;
    };

    const foodItemsOptions = !values.privateAll ? weeklyPlanProps.response.payload.weeklyPlanData.foodItemsSelectOptions : weeklyPlanProps.response.payload.weeklyPlanData.foodItemsSelectOptionsAllPrivate;
    const foodItemsOptionsObj = !values.privateAll ? weeklyPlanProps.response.payload.weeklyPlanData.availableFoodItems : weeklyPlanProps.response.payload.weeklyPlanData.availableFoodItemsAllPrivate;

    const mealOptions = !values.privateAll ? weeklyPlanProps.response.payload.weeklyPlanData.mealsSelectOptions : weeklyPlanProps.response.payload.weeklyPlanData.mealsSelectOptionsAllPrivate;
    const mealOptionsObj = !values.privateAll ? weeklyPlanProps.response.payload.weeklyPlanData.availableMeals : weeklyPlanProps.response.payload.weeklyPlanData.availableMealsAllPrivate;

    //Component used to add meals
    const MealSelect = ({ setFieldValue}) => {
        const [name, setName] = useState('Please select a meal!')
        const [id, setId] = useState('')
        const [image, setImage] = useState(null)
        const [error, setError] = useState({name: '', mealType: ''})
        const [touched, setTouched] = useState({name: false, mealType: false})
        const [mealType, setMealType] = useState("Meal Type")

        const mealTypeOptions = [
            { value: fieldNameMealBreakfast, label: 'Breakfast' },
            { value: fieldNameMealLunch, label: 'Lunch' },
            { value: fieldNameMealDinner, label: 'Dinner' },
        ];   
        
        function getMealOptionLabel(value) {
            const selectedOption = mealTypeOptions.find((option) => option.value === value);
            return selectedOption ? selectedOption.label : 'Meal Type';
        }

        function checkDuplicateMeals(meal) {
            if (meal != "Meal Type") {
                for (let i = 0; i < values[meal].length; i++) {
                    if (name == values[meal][i].name) {
                        setName("Please select a meal!")
                    }
                }
            }
        }

        function updateIdSelect (selectedOption) {
            const currentMeal = mealOptionsObj.find(meal => meal.name === selectedOption)
            //console.log(currentFoodItem)
            setId(currentMeal._id as unknown as string)
            setImage(currentMeal.image)
        };

        const checkError = (updatedName, mealType, touchedName, touchedMealType) => {
            var nameError, mealTypeErr: string
            if(updatedName == "Please select a meal!" && touchedName) {
                nameError = "Please select a meal!"
            } else {
                nameError = ""
            } 
            
            if (mealType == "Meal Type" && touchedMealType) {
                mealTypeErr = "Select a meal Type!"
            } else {
                mealTypeErr = ""
            }
            setError({name: nameError, mealType: mealTypeErr})
        }

        const addNewField = () => {
            const currentArray = values[mealType];
            const updatedArray = [...currentArray];
            updatedArray.push({name: name, id: id, image: image});
            setFieldValue(mealType, updatedArray); //"foodItems"
        };
          
        //Custom styles as tailwind doesn't work properly for React Select
        const customStyles = {
            control: (provided) => ({
              ...provided,
              borderRadius: '0.375rem',
              '@media (max-width: 767px)': {
                height: '20px',
                width: '240px'
              },
              '@media (min-width: 768px)': {
                height: '40px',
                width: '270px'
              },
            }),
        };

        const customStyles2 = {
            control: (provided) => ({
              ...provided,
              borderRadius: '0.375rem',
              '@media (max-width: 767px)': {
                height: '20px',
                width: '165px'
              },
              '@media (min-width: 768px)': {
                height: '40px',
                width: '180px'
              },
            }),
        };

        return (
            <div className={`flex flex-col bg-green-100 border rounded-xl`}>
                <div className='flex flex-row items-center mt-1 mb-1 md:mt-2 md:mb-2  gap-1'>
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
                    
                    <div className='flex flex-col gap-1 md:gap-2'>
                        <Select
                            className="text-sm md:text-base mr-1"
                            styles={customStyles}
                            instanceId={instanceId}
                            isSearchable={true}
                            value={{ value: name, label: name }}
                            options={
                                mealOptions.filter(item => {
                                    if (mealType != "Meal Type") {
                                        for (let i = 0; i < values[mealType].length; i++) {
                                            if (item.value == values[mealType][i].name) {
                                                return false;
                                            }
                                        }
                                    }
                                    return true;
                                })
                            }
                            onChange={(selectedOption) => { 
                                setName(selectedOption.value)
                                updateIdSelect(selectedOption.value)
                                checkError(selectedOption.value, mealType, true, touched.mealType)  
                                setTouched({name: true, mealType: touched.mealType})
                                }}
                        />

                        <div className="gap-1 flex flex-row items-center">
                            <Select
                                className="text-sm md:text-base"
                                styles={customStyles2}
                                instanceId={instanceId}
                                isSearchable={true}
                                value={{ value: mealType, label: getMealOptionLabel(mealType) }}
                                options={mealTypeOptions}
                                onChange={(selectedOption) => { 
                                    setMealType(selectedOption.value)
                                    checkDuplicateMeals(selectedOption.value)
                                    }}
                            />

                            <div className="min-w-[10px] mr-1 md:mr-1">
                                <button
                                type="button"
                                className={`${styles.button_medium} whitespace-nowrap`}
                                onClick={() => { if(name != "Please select a meal!" && mealType != "Meal Type") {
                                    addNewField()
                                    setName("Please select a meal!")
                                    setMealType("Meal Type")
                                    setImage("")
                                    setError({name: "", mealType: ""})
                                    setTouched({name: false, mealType: false})
                                    checkError(name, mealType, false, false)
                                    } else {
                                        setTouched({name: true, mealType: true})
                                        checkError(name, mealType, true, true)
                                        console.log(`name:${name} and qty: ${mealType}`)
                                    }}
                                }
                                >
                                    <span className=" ml-1 mr-1 md:ml-2 md:mr-2">Add Meal</span>
                                </button>

                            </div>
                        </div>
                    </div>

                </div>

                <div className='flex ml-4'>
                    <span className={`text-rose-500 mr-5 text-sm md:text-base ${error.name || error.mealType ? "mb-1" : ""}`}>
                    {`${error.name} ${error.name != "" ? " " : ""} ${error.mealType}`}
                    </span>
                </div>
                
            </div>                        
        );
    };

    //Component used to add food items
    const FoodSelect = ({ setFieldValue}) => {
        const [name, setName] = useState('Please select a food item!')
        const [qty, setQty] = useState<any>(0)
        const [qtyOption, setQtyOption] = useState('')
        const [id, setId] = useState('')
        const [image, setImage] = useState(null)
        const [error, setError] = useState({name: '', qty: ''})
        const [touched, setTouched] = useState({name: false, qty: false})
          

        function updateQtyOptionAndIdSelect (selectedOption) {
            const currentFoodItem = foodItemsOptionsObj.find(food => food.name === selectedOption)
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
            const currentArray = values[fieldNameSnaks];
            const updatedArray = [...currentArray];
            updatedArray.push({name: name, qty: qty, qtyOption: qtyOption, id: id, image: image});
            setFieldValue(fieldNameSnaks, updatedArray);
        };
          
        //Custom styles as tailwind doesn't work for React Select
        const customStyles = {
            control: (provided) => ({
              ...provided,
              borderRadius: '0.375rem',
              '@media (max-width: 767px)': {
                height: '30px',
                width: '240px'
              },
              '@media (min-width: 768px)': {
                height: '40px',
                width: '270px'
              },
            }),
        };

        return (
            <div className={` flex flex-col min-h-[72px] bg-green-100 border rounded-xl`}>
                <div className='flex flex-row mt-1 mb-1 md:mt-2 md:mb-2 items-center '>
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
                    
                    <div className='flex flex-col gap-1 md:gap-2 ml-1 mr-1'> 
                        <Select
                            className="mb-0.5 md:mb-0 items-center text-sm md:text-base"
                            styles={customStyles}
                            instanceId={instanceId}
                            isSearchable={true}
                            value={{ value: name, label: name }}
                            options={
                                foodItemsOptions.filter(item => {
                                    for (let i = 0; i < values[fieldNameSnaks].length; i++) {
                                        if (item.value == values[fieldNameSnaks][i].name) {
                                            return false;
                                        }
                                    }
                                    return true;
                                })
                            }
                            onChange={(selectedOption) => { 
                                setName(selectedOption.value)
                                updateQtyOptionAndIdSelect(selectedOption.value)
                                checkError(selectedOption.value, qty, true, touched.qty)  
                                setTouched({name: true, qty: touched.qty})
                                }}
                        />

                        <div className="gap-1 md:gap-1 flex flex-row items-center">
                            <div className='w-[165px] md:w-[180px] flex flex-row justify-between items-center border rounded-lg h-8 md:h-10 bg-white text-sm md:text-base'>
                                <input type='number' name='qty' className='w-[85px] md:w-[100px] rounded-lg h-full pl-2' value={qty} 
                                onChange={(e) => {setQty(Number(e.target.value)) ; 
                                checkError(name, Number(e.target.value), touched.name, true); setTouched({name: touched.name, qty: true})}} 
                                onKeyDown={(e) => {
                                    if (e.key === 'Backspace' && qty >=-9 && qty <=9) {
                                    setQty('');
                                    }
                                }}
                                />
                                <div className='mr-2 flex items-center text-sm justify-center h-full'>{'['}{qtyOption}{']'}</div>
                            </div>

                            <div className="min-w-[10px] ">
                                <button
                                type="button"
                                className={`${styles.button_medium} whitespace-nowrap`}
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
                                    <span className=" ml-1 mr-1 md:ml-2 md:mr-2">Add Food</span>
                                </button>

                            </div>
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

    return (
    <div className='w-[320px] md:w-[750px] mb-1 md:mb-3 md:grid md:grid-cols-2 md:grid-rows-1  gap-5 md:gap-x-10 '>
        <div className='md:col-span-1 flex flex-col justify-between'>

            <FieldArray
            name={`${fieldNameMealBreakfast}`}
            render={arrayHelpers => (
                <div className='w-full flex flex-col mb-1'>
                    <p className="mb-1 md:text-lg font-bold text-left">{`${fieldNameUpper} Breakfast:`}</p>
                    {values[fieldNameMealBreakfast] && values[fieldNameMealBreakfast].map((name, index) => (
                    <div key={index} className={`flex flex-col  w-full ${index < values[fieldNameMealBreakfast].length - 1 ? 'mb-1' : 'mb-1'}`}>
                        <div className={`flex flex-row items-center `}>
                            <div className='w-16 h-16 ml-1 md:ml-2 flex items-center justify-center'>
                                {values[fieldNameMealBreakfast][index].image ?
                                    <Image
                                        className={`${styles.avatar_medium} border-2 flex justify-start`}
                                        cloudName={process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}
                                        publicId={values[fieldNameMealBreakfast][index].image}
                                        alt={values[fieldNameMealBreakfast][index].image ? values[fieldNameMealBreakfast][index].image as string : ''} 
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
                            
                            <div className='flex flex-row items-center ml-1 '>
                                <div className="flex items-center overflow-hidden pl-2 w-[215px] mb-0.5 md:mb-0 md:w-[230px] text-sm md:text-base border rounded-lg h-8 md:h-10 bg-white">
                                    <p className="text-center whitespace-nowrap truncate">{values[fieldNameMealBreakfast][index].name}</p>
                                </div>

                                <div className="min-w-[20px] mb-1 px-1 ">
                                    <button type="button" onClick={() => arrayHelpers.remove(index)}
                                    className={`${styles.button_no_bg} bg-gradient-to-r from-red-500 to-red-600`}>
                                        <FontAwesomeIcon icon={faTrash} className="w-4.5 h-4.5 mt-1 ml-1 mr-1 md:ml-2 md:mr-2" aria-hidden="true" />
                                    </button>
                                </div>

                            </div>
                        </div>
                        
                    </div>
                ))}  

                <div className={`text-rose-500 mr-5 text-sm md:text-base mt-0.5 md:mt-1 ml-2 mb-1`}>
                    <ErrorMessage name={fieldNameMealBreakfast}>
                        {(errorMsg) => {
                        const hasMaxError = errorMsg.includes('Maximum 3 meals are allowed!');
                        return hasMaxError ? <div>{errorMsg}</div> : null;
                        }}
                    </ErrorMessage>
                </div>  

            </div>
            )}
            />

            <FieldArray
            name={`${fieldNameMealLunch}`}
            render={arrayHelpers => (
                <div className='w-full flex flex-col mb-1'>
                    <p className="mb-1 md:text-lg font-bold text-left">{`${fieldNameUpper} Lunch:`}</p>
                    {values[fieldNameMealLunch] && values[fieldNameMealLunch].map((name, index) => (
                    <div key={index} className={`flex flex-col  w-full ${index < values[fieldNameMealLunch].length - 1 ? 'mb-1' : 'mb-1'}`}>
                        <div className={`flex flex-row items-center `}>
                            <div className='w-16 h-16 ml-1 md:ml-2 flex items-center justify-center'>
                                {values[fieldNameMealLunch][index].image ?
                                    <Image
                                        className={`${styles.avatar_medium} border-2 flex justify-start`}
                                        cloudName={process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}
                                        publicId={values[fieldNameMealLunch][index].image}
                                        alt={values[fieldNameMealLunch][index].image ? values[fieldNameMealLunch][index].image as string : ''} 
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
                            
                            <div className='flex flex-row items-center ml-1 '>
                                <div className="flex items-center overflow-hidden pl-2 w-[215px] mb-0.5 md:mb-0 md:w-[230px] text-sm md:text-base border rounded-lg h-8 md:h-10 bg-white">
                                    <p className="text-center whitespace-nowrap truncate">{values[fieldNameMealLunch][index].name}</p>
                                </div>

                                <div className="min-w-[20px] mb-1 px-1 ">
                                    <button type="button" onClick={() => arrayHelpers.remove(index)}
                                    className={`${styles.button_no_bg} bg-gradient-to-r from-red-500 to-red-600`}>
                                        <FontAwesomeIcon icon={faTrash} className="w-4.5 h-4.5 mt-1 ml-1 mr-1 md:ml-2 md:mr-2" aria-hidden="true" />
                                    </button>
                                </div>

                            </div>
                        </div>
                        
                    </div>
                ))}

                <div className={`text-rose-500 mr-5 text-sm md:text-base mt-0.5 md:mt-1 ml-2 mb-1`}>
                    <ErrorMessage name={fieldNameMealLunch}>
                        {(errorMsg) => {
                        const hasMaxError = errorMsg.includes('Maximum 3 meals are allowed!');
                        return hasMaxError ? <div>{errorMsg}</div> : null;
                        }}
                    </ErrorMessage>
                </div>  
                

            </div>
            )}
            />

            <FieldArray
            name={`${fieldNameMealDinner}`}
            render={arrayHelpers => (
                <div className='w-full flex flex-col mb-1'>
                    <p className="mb-1 md:text-lg font-bold text-left">{`${fieldNameUpper} Dinner:`}</p>
                    {values[fieldNameMealDinner] && values[fieldNameMealDinner].map((name, index) => (
                    <div key={index} className={`flex flex-col  w-full ${index < values[fieldNameMealDinner].length - 1 ? 'mb-1' : 'mb-1'}`}>
                        <div className={`flex flex-row items-center `}>
                            <div className='w-16 h-16 ml-1 md:ml-2 flex items-center justify-center'>
                                {values[fieldNameMealDinner][index].image ?
                                    <Image
                                        className={`${styles.avatar_medium} border-2 flex justify-start`}
                                        cloudName={process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}
                                        publicId={values[fieldNameMealDinner][index].image}
                                        alt={values[fieldNameMealDinner][index].image ? values[fieldNameMealDinner][index].image as string : ''} 
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
                            
                            <div className='flex flex-row items-center ml-1 '>
                                <div className="flex items-center overflow-hidden pl-2 w-[215px] mb-0.5 md:mb-0 md:w-[230px] text-sm md:text-base border rounded-lg h-8 md:h-10 bg-white">
                                    <p className="text-center whitespace-nowrap truncate">{values[fieldNameMealDinner][index].name}</p>
                                </div>

                                <div className="min-w-[20px] mb-1 px-1 ">
                                    <button type="button" onClick={() => arrayHelpers.remove(index)}
                                    className={`${styles.button_no_bg} bg-gradient-to-r from-red-500 to-red-600`}>
                                        <FontAwesomeIcon icon={faTrash} className="w-4.5 h-4.5 mt-1 ml-1 mr-1 md:ml-2 md:mr-2" aria-hidden="true" />
                                    </button>
                                </div>

                            </div>
                        </div>
                        
                    </div>
                ))}

                <div className={`text-rose-500 mr-5 text-sm md:text-base mt-0.5 md:mt-1 ml-2 mb-1`}>
                    <ErrorMessage name={`${fieldNameMealDinner}`} component="div"/>
                </div>              
                
            </div>
            )}
            />

            <MealSelect setFieldValue={setFieldValue}/>
        
        </div>

        <div className='mt-3 md:mt-0 md:col-span-1 md:flex md:flex-col md:justify-between'>
            <FieldArray
            name={`${fieldNameSnaks}`}
            render={arrayHelpers => (
                <div className='w-full flex flex-col '>
                    <p className="mb-1 md:text-lg font-bold text-left">{`${fieldNameUpper} Snacks:`}</p>
                {values[fieldNameSnaks] && values[fieldNameSnaks].map((name, index) => (
                    <div key={index} className={`flex flex-col justify-start w-full ${index < values[fieldNameSnaks].length - 1 ? 'mb-2 md:mb-3' : 'mb-0'}`}>
                        
                        <div className={`flex flex-row items-center `}>
                            <div className='w-16 h-16 ml-1 flex items-center justify-center'>
                                {values[fieldNameSnaks][index].image ?
                                    <Image
                                        className={`${styles.avatar_medium} border-2 flex justify-start`}
                                        cloudName={process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}
                                        publicId={values[fieldNameSnaks][index].image}
                                        alt={values[fieldNameSnaks][index].image ? values[fieldNameSnaks][index].image as string : ''} 
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
                            
                            <div className='flex flex-wrap ml-2 max-w-[245px] md:max-w-[275px]  gap-1 md:gap-2'>
                                <div className="flex items-center overflow-hidden pl-2 w-60 mb-0.5 md:mb-0 md:w-[270px] text-sm md:text-base border rounded-lg h-8 md:h-10 bg-white">
                                    <p className="text-center whitespace-nowrap truncate">{values[fieldNameSnaks][index].name}</p>
                                </div>

                                <div className='flex items-center justify-between w-[159px] md:w-[180px] border rounded-lg h-8 md:h-10 bg-white text-sm md:text-base'>
                                    <Field  type='number' name={`${fieldNameSnaks}.${index}.qty`} className={`w-20 md:w-24 rounded-lg h-full pl-2`}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setFieldValue(`${fieldNameSnaks}.${index}.qty`, value !== '' ? Number(value) : null); // Convert to number or set to null
                                        }}
                                    />
                                    <div className='ml-1 mr-2 flex items-center justify-center h-full'>{'['}{values[fieldNameSnaks][index].qtyOption}{']'}</div>
                                </div>

                                <div className="min-w-[10px] ml-3 md:ml-0 mr-1 md:mr-1">
                                    <button
                                    type="button"
                                    className={`${styles.button_no_bg} py-1 whitespace-nowrap bg-gradient-to-r from-red-500 to-red-600`}
                                    onClick={() => arrayHelpers.remove(index)}
                                    >
                                        <span className="ml-1 mr-1 md:ml-2 md:mr-2">Remove</span>
                                    </button>
                                </div>
                            </div>

                        </div>
                    
                        <div className={`text-rose-500 mr-5 text-left text-sm md:text-base ml-20 mt-1 md:mt-0 mb-1`}>
                            <ErrorMessage name={`${fieldNameSnaks}[${index}].qty`} component="div"/>
                        </div>
                        
                    </div>
                ))}

                <div className={`text-rose-500 mr-5 text-sm md:text-base mt-1 md:mt-2 ml-2 mb-1`}>
                    <ErrorMessage name={`${fieldNameSnaks}`}>
                        {(error) => <ErrorDisplay error={error} />}
                    </ErrorMessage>
                </div>                      

            </div>
            )}
            />

            <FoodSelect setFieldValue={setFieldValue}/>
        </div>
    </div>
    );
};


export const DailyInputFieldArrayView = ({ values,  fieldName }) => {
    const fieldNameUpper = fieldName ? fieldName.charAt(0).toUpperCase() + fieldName.slice(1).toLowerCase() : '';
    const fieldNameMealBreakfast = fieldName ? fieldName + "MealsBreakfast" : 'MondayMeals';
    const fieldNameMealLunch = fieldName + "MealsLunch";
    const fieldNameMealDinner = fieldName + "MealsDinner";
    const fieldNameSnaks = fieldName ? fieldName + "Snaks" : 'MondaySnaks';

    return (
    <div className='mt-2 md:mt-3 w-[320px] md:w-[750px] mb-1 md:mb-3 md:grid md:grid-cols-2 md:grid-rows-1  gap-5 md:gap-x-10 '>
        <div className='md:col-span-1 flex flex-col justify-between'> 
            <div className='w-full flex flex-col mb-1'>
                <p className="mb-1 md:text-lg font-bold text-left">{`${fieldNameUpper} Breakfast:`}</p>
                {values[fieldNameMealBreakfast] && values[fieldNameMealBreakfast].map((name, index) => (
                <div key={index} className={`flex flex-col  w-full ${index < values[fieldNameMealBreakfast].length - 1 ? 'mb-1' : 'mb-1'}`}>
                    <div className={`flex flex-row items-center `}>
                        <div className='w-16 h-16 ml-1 md:ml-2 flex items-center justify-center'>
                            {values[fieldNameMealBreakfast][index].image ?
                                <Image
                                    className={`${styles.avatar_medium} border-2 flex justify-start`}
                                    cloudName={process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}
                                    publicId={values[fieldNameMealBreakfast][index].image}
                                    alt={values[fieldNameMealBreakfast][index].image ? values[fieldNameMealBreakfast][index].image as string : ''} 
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
                        
                        <div className='flex flex-row items-center ml-1 '>
                            <div className="flex items-center overflow-hidden pl-2 w-[245px] md:w-[275px] mb-0.5 md:mb-0 text-sm md:text-base border rounded-lg h-8 md:h-10 bg-white">
                                <p className="text-center whitespace-nowrap truncate">{values[fieldNameMealBreakfast][index].name}</p>
                            </div>

                        </div>
                    </div>
                    
                </div>
                ))}  
            </div>

            <div className='w-full flex flex-col mb-1'>
                <p className="mb-1 md:text-lg font-bold text-left">{`${fieldNameUpper} Lunch:`}</p>
                {values[fieldNameMealLunch] && values[fieldNameMealLunch].map((name, index) => (
                <div key={index} className={`flex flex-col  w-full ${index < values[fieldNameMealLunch].length - 1 ? 'mb-1' : 'mb-1'}`}>
                    <div className={`flex flex-row items-center `}>
                        <div className='w-16 h-16 ml-1 md:ml-2 flex items-center justify-center'>
                            {values[fieldNameMealLunch][index].image ?
                                <Image
                                    className={`${styles.avatar_medium} border-2 flex justify-start`}
                                    cloudName={process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}
                                    publicId={values[fieldNameMealLunch][index].image}
                                    alt={values[fieldNameMealLunch][index].image ? values[fieldNameMealLunch][index].image as string : ''} 
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
                        
                        <div className='flex flex-row items-center ml-1 '>
                            <div className="flex items-center overflow-hidden pl-2 w-[245px] md:w-[275px] mb-0.5 md:mb-0 text-sm md:text-base border rounded-lg h-8 md:h-10 bg-white">
                                <p className="text-center whitespace-nowrap truncate">{values[fieldNameMealLunch][index].name}</p>
                            </div>

                        </div>
                    </div>
                    
                </div>
                ))}  
            </div>

            <div className='w-full flex flex-col mb-1'>
                <p className="mb-1 md:text-lg font-bold text-left">{`${fieldNameUpper} Dinner:`}</p>
                {values[fieldNameMealDinner] && values[fieldNameMealDinner].map((name, index) => (
                <div key={index} className={`flex flex-col  w-full ${index < values[fieldNameMealDinner].length - 1 ? 'mb-1' : 'mb-1'}`}>
                    <div className={`flex flex-row items-center `}>
                        <div className='w-16 h-16 ml-1 md:ml-2 flex items-center justify-center'>
                            {values[fieldNameMealDinner][index].image ?
                                <Image
                                    className={`${styles.avatar_medium} border-2 flex justify-start`}
                                    cloudName={process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}
                                    publicId={values[fieldNameMealDinner][index].image}
                                    alt={values[fieldNameMealDinner][index].image ? values[fieldNameMealDinner][index].image as string : ''} 
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
                        
                        <div className='flex flex-row items-center ml-1 '>
                            <div className="flex items-center overflow-hidden pl-2 w-[245px] md:w-[275px] mb-0.5 md:mb-0 text-sm md:text-base border rounded-lg h-8 md:h-10 bg-white">
                                <p className="text-center whitespace-nowrap truncate">{values[fieldNameMealDinner][index].name}</p>
                            </div>

                        </div>
                    </div>
                    
                </div>
                ))}  
            </div>
        </div>

        <div className='mt-2 md:mt-0 md:col-span-1 md:flex md:flex-col md:justify-between'>
            <div className='w-full flex flex-col '>
                <p className="mb-1 md:text-lg font-bold text-left">{`${fieldNameUpper} Snacks:`}</p>
                {values[fieldNameSnaks] && values[fieldNameSnaks].map((name, index) => (
                <div key={index} className={`flex flex-col justify-start w-full ${index < values[fieldNameSnaks].length - 1 ? 'mb-2 md:mb-3' : 'mb-0'}`}>
                    
                    <div className={`flex flex-row items-center `}>
                        <div className='w-16 h-16 ml-1 flex items-center justify-center'>
                            {values[fieldNameSnaks][index].image ?
                                <Image
                                    className={`${styles.avatar_medium} border-2 flex justify-start`}
                                    cloudName={process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}
                                    publicId={values[fieldNameSnaks][index].image}
                                    alt={values[fieldNameSnaks][index].image ? values[fieldNameSnaks][index].image as string : ''} 
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
                        
                        <div className='flex flex-col justify-end ml-2 max-w-[245px] md:max-w-[275px]  gap-1 md:gap-2'>
                            <div className="flex items-center overflow-hidden pl-2 w-60 mb-0.5 md:mb-0 md:w-[270px] text-sm md:text-base border rounded-lg h-8 md:h-10 bg-white">
                                <p className="text-center whitespace-nowrap truncate">{values[fieldNameSnaks][index].name}</p>
                            </div>

                            <div className='flex self-start items-center justify-between w-[159px] md:w-[180px] border rounded-lg h-8 md:h-10 bg-white text-sm md:text-base'>
                                <div className={`w-20 md:w-24 flex items-center rounded-lg h-full pl-2`}>{values[fieldNameSnaks][index].qty}</div>
                                <div className='ml-1 mr-2 flex items-center justify-center h-full'>{'['}{values[fieldNameSnaks][index].qtyOption}{']'}</div>
                            </div>
                        </div>

                    </div>
                
                </div>
                ))}           

            </div>

        </div>
    </div>
    );

};