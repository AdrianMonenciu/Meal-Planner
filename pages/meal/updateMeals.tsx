import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { toast } from "react-toastify"
import Layout from "../../components/layout"
import { IUser } from '../../models/user'
import { IMeal } from '../../models/Meal'
import * as Yup from "yup";
import styles from '../../styles/Form.module.css';
import { useRouter } from "next/router";

interface FormValues {
  mealName: string;
}

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

interface IFoodItems {
  results: IMeal[];
}

interface Idelete {
  name: string;
}


export default function ApiExamplePage() {
  const [meals, setMeals] = useState<Service<IFoodItems>>({status: 'loading'})

  const router = useRouter()

  function handleUserDelete(name: string) { 
    return async (event: React.MouseEvent) => {
    //toast(`User: ${username} will be deleted!`)

    const meal_delete_api_body: Idelete ={
      name: name,
    }
    const options = {
        method: "DELETE",
        headers : { 'Content-Type': 'application/json'},
        body: JSON.stringify(meal_delete_api_body)
    }
    // console.log(values)
    //console.log(user_api_body)

    await fetch('/api/meal/meal', options)
    .then(res => res.json())
    .then((data) => {
      //console.log(data)
      //alert(data.message)
      toast(data.message)
      const updatedFoodItems: FormValues = {
        mealName : formik.values.mealName,
      }
      onSubmit(updatedFoodItems)
    })

  }}

  async function getInitialData(querryData: FormValues) {
    const options = {
      method: "GET",
      headers : { 'Content-Type': 'application/json'},
    }
    await fetch(`/api/meal/getMeals?mealName=${querryData.mealName}&limit=20`, options)
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
    .then(data => {setMeals({ status: 'loaded', payload: data })
      //console.log(data)
    })
    .catch(err => {setMeals({ status: 'error', error: err.message})});
  }

  useEffect(() => {
    getInitialData({mealName: ''}) 
  },[])

  async function onSubmit (values: FormValues){
    getInitialData({mealName: values.mealName})
  }

  const initialValues: FormValues = {
    mealName : '',
  }

  const validationSchemaYup: Yup.SchemaOf<FormValues> = Yup.object().shape({
    mealName: Yup.string().required('Meal name required').min(2, "The name must have at least 2 characters!")
    .max(20, "The name must have maximum 20 characters!")
    .test("Empty space", "Name can not start with SPACE!", function(value) {if (value) return  !(value.charAt(0) === " "); else return true }),
    });

  const formik = useFormik({
    initialValues: initialValues,
    //validate: registerValidate,
    validationSchema: validationSchemaYup,
    onSubmit
})

  return (
    <Layout>
      <h1>Meals list</h1>
      <form className='flex flex-col' onSubmit={formik.handleSubmit}>
        <div className={`${styles.input_group} ${formik.errors.mealName && formik.touched.mealName ? 'border-rose-600' : ''}`}>
          <input 
          type="text"
          name='mealName'
          placeholder='Meal Name'
          className={styles.input_text}
          {...formik.getFieldProps('mealName')}
          />
        </div>
        <div className="input-button">
          <button type='submit' className={styles.button}>
              Search
          </button>
        </div>
      </form>
      <div className='flex flex-col'>
        {meals.status === 'loading' && <div>Loading...</div>}
        {meals.status === 'loaded' && 
          meals.payload.results.map((meal, index) => (
            <div key={index} className={`flex justify-between`}>
              <div className="flex justify-start">
                <div>Meal name: {meal.name}</div>
                <div className='mx-4'>Diet: {meal.diet.map((diet, index) => `${diet} `)}</div>
              </div>
              <span className="flex justify-end">
                  <button onClick={() => router.push(`/meal/mealEdit/${meal.name}`)} className='bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded m-2'> 
                    EDIT</button>
                  <button onClick={handleUserDelete(meal.name)} className={`bg-red-400 hover:bg-red-700 text-white font-bold py-2 px-4 rounded m-2`}> 
                    DELETE</button>
                </span>
            </div>
          ))
        }
        {meals.status === 'error' && (
          <div>{meals.error}</div>
        )}
      </div>
      
    </Layout>
  )
}

//<pre>{JSON.stringify(food, null, 2)}</pre>
//<pre>{JSON.stringify(users, null, 2)}</pre>

// {users && service.payload.results.map((user, index) => (
//   <div key={index}>{JSON.stringify(user.username, null, 2)}</div>))}


// users.payload.results.map((user, index) => (
//   <>
//     <div key={index}>{user.username}</div>
//     <pre>{JSON.stringify(user, null, 2)}</pre>
//   </>
// ))
