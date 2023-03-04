
import styles from '../styles/Form.module.css';
import { useEffect, useState, useRef, useId } from 'react';
import { ErrorMessage, Field, FieldArray, Form, Formik, useFormik, useFormikContext } from 'formik';
import Select from 'react-select';
import React from 'react';

export const DailyInputFieldArray = ({ values, weeklyPlanProps, setFieldValue,  fieldName }) => {
    const fieldNameUpper = fieldName ? fieldName.charAt(0).toUpperCase() + fieldName.slice(1).toLowerCase() : '';
    const fieldNameMeal = fieldName ? fieldName + "Meals" : 'MondayMeals';
    const fieldNameSnaks = fieldName ? fieldName + "Snaks" : 'MondaySnaks';
    const instanceId = useId();
    const instanceId2 = useId();

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
    <>
        <FieldArray
        name={`${fieldNameMeal}`}
        render={(arrayHelpers) => (
            <div>
            <p className="w-3/4 mx-auto text-gray-400">{`${fieldNameUpper} Meals`}</p>
            {values[fieldNameMeal] && values[fieldNameMeal].map((name, index) => (
                <div
                key={index}
                className={`${styles.input_group} flex column justify-evenly color to-blue-200 `}
                >
                <Field name={`${fieldNameMeal}[${index}].name`}>
                    {({ field, form }) => (
                    <Select
                        className="select-wrap w-500"
                        classNamePrefix="select-box"
                        instanceId={instanceId}
                        isSearchable={true}
                        value={{
                        value: values[fieldNameMeal][index].name,
                        label: values[fieldNameMeal][index].name,
                        }}
                        options={
                        //availableFoodItems
                        weeklyPlanProps.response.payload.weeklyPlanData.mealsSelectOptions.filter(
                            (item) => {
                            for (let i = 0; i < values[fieldNameMeal].length; i++) {
                                if (item.value == values[fieldNameMeal][i].name) {
                                return false;
                                }
                            }
                            return true;
                            }
                        )
                        }
                        onChange={(selectedOption) => {
                        form.setFieldValue(`${fieldNameMeal}.${index}.name`, selectedOption.value);
                        updateId(index, selectedOption.value, setFieldValue, fieldNameMeal);
                        form.setFieldValue(`shoppingListIsUpdated`, false)
                        //generateShoppingList(values)
                        }}
                    />
                    )}
                </Field>

                <ErrorMessage name={`${fieldNameMeal}.${index}.name`} />
                <div className="input-button m-2">
                    <button
                    type="button"
                    className={styles.button}
                    onClick={() => arrayHelpers.remove(index)}
                    >
                    Remove input
                    </button>
                </div>
                </div>
            ))}
            <button type="button" onClick={() => arrayHelpers.push({ name: '', id: '' })}>
                Add input
            </button>
            </div>
        )}
        />

        <FieldArray
        name={`${fieldNameSnaks}`}
        render={arrayHelpers => (
            <div>
                <p className='w-3/4 mx-auto text-gray-400'>{`${fieldNameUpper} Snacks`}</p>
            {values[fieldNameSnaks].map((name, index) => (
                <div key={index} className={`${styles.input_group} flex column justify-evenly color to-blue-200 `}>
                    {/*<Field name={`names.${index}`} className={styles.input_group}/>*/}
                    <Field name={`${fieldNameSnaks}[${index}].name`}>
                    {({ field, form }) => (
                    <Select
                        className="select-wrap w-500"
                        classNamePrefix="select-box"
                        instanceId={instanceId2}
                        isSearchable={true}
                        value={{ value: values[fieldNameSnaks][index].name, label: values[fieldNameSnaks][index].name }}
                        //defaultValue={{ value: values.names[index].name, label: values.names[index].name }}
                        options={
                            //availableFoodItems
                            weeklyPlanProps.response.payload.weeklyPlanData.foodItemsSelectOptions.filter(item => {
                                for (let i = 0; i < values[fieldNameSnaks].length; i++) {
                                    if (item.value == values[fieldNameSnaks][i].name) {
                                        //console.log(`curent av food: ${item.value},  current value: ${values.foodItems[i].name}`)
                                        return false;
                                    }
                                }
                                return true;
                            })
                        }
                        //options= {formik.values.diet.map((diet, index) => ({value : diet, label : diet}))}
                        onChange={(selectedOption) => { 
                            form.setFieldValue(`${fieldNameSnaks}.${index}.name`, selectedOption.value,)
                            updateQtyOptionAndId(index, selectedOption.value, setFieldValue, fieldNameSnaks)
                            form.setFieldValue(`shoppingListIsUpdated`, false)
                            }}
                    />)}
                    </Field>
                    <Field  type='number' name={`${fieldNameSnaks}.${index}.qty`} className={styles.input_group} default={''}
                        onChange={(e) => {
                            const inputValue = e.target.value;
                            let numericValue;
                            if (inputValue === '') {
                                numericValue = '';
                            } else {
                                numericValue = Number(inputValue);
                            }
                            setFieldValue("shoppingListIsUpdated", false);
                            setFieldValue(`${fieldNameSnaks}.${index}.qty`, numericValue);
                        }}
                    />
                    <Field  name={`${fieldNameSnaks}.${index}.qtyOption`} className={styles.input_group} readOnly/>
                    <ErrorMessage name={`${fieldNameSnaks}.${index}.name`} />
                    <ErrorMessage name={`${fieldNameSnaks}.${index}.qty`} />
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
    </>
    );
};

export const DailyInputFieldArrayView = ({ values, weeklyPlanProps,  fieldName }) => {
    const fieldNameUpper = fieldName.charAt(0).toUpperCase() + fieldName.slice(1).toLowerCase()
    const fieldNameMeal = fieldName + "Meals"
    const fieldNameSnaks = fieldName + "Snaks"

    return (
    <>
        <FieldArray
        name={`${fieldNameMeal}`}
        render={(arrayHelpers) => (
            <div>
            <p className="w-3/4 mx-auto text-gray-400">{`${fieldNameUpper} Meals`}</p>
            {values[fieldNameMeal].map((name, index) => (
                <div
                key={index}
                className={`${styles.input_group} flex column justify-evenly color to-blue-200 `}
                >
                    <Field  name={`${fieldNameMeal}[${index}].name`} className={styles.input_group} readOnly/>
                </div>
            ))}
            </div>
        )}
        />

        <FieldArray
        name={`${fieldNameSnaks}`}
        render={arrayHelpers => (
            <div>
                <p className='w-3/4 mx-auto text-gray-400'>{`${fieldNameUpper} Snacks`}</p>
            {values[fieldNameSnaks].map((name, index) => (
                <div key={index} className={`${styles.input_group} flex column justify-evenly color to-blue-200 `}>
                    {/*<Field name={`names.${index}`} className={styles.input_group}/>*/}
                    <Field name={`${fieldNameSnaks}[${index}].name`} className={styles.input_group} readOnly/>
                    <Field  type='number' name={`${fieldNameSnaks}.${index}.qty`} className={styles.input_group} readOnly/>
                    <Field  name={`${fieldNameSnaks}.${index}.qtyOption`} className={styles.input_group} readOnly/>
                    <div className="input-button m-2">
                    </div>
                </div>
                ))}
        </div>
        )}
        />
    </>
    );
};

export default DailyInputFieldArray;