import Head from 'next/head'
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { toast } from "react-toastify"
import Layout from "../../components/layout"
import { IUser } from '../../models/user'
import { IFood } from '../../models/FoodItem'
import * as Yup from "yup";
import styles from '../../styles/Form.module.css';
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { faEdit } from '@fortawesome/free-solid-svg-icons'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { Image } from "cloudinary-react";

interface FormValues {
  foodName: string;
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
  results: IFood[];
}

interface IupdateRole {
  username: string;
  userRole: string;
}

interface Idelete {
  name: string;
}


export default function ApiExamplePage() {
  const [foodItems, setFoodItems] = useState<Service<IFoodItems>>({status: 'loading'})

  const router = useRouter()

  function handleUserDelete(name: string) { 
    return async (event: React.MouseEvent) => {
    //toast(`User: ${username} will be deleted!`)

    const user_api_body: Idelete ={
      name: name,
    }
    const options = {
        method: "DELETE",
        headers : { 'Content-Type': 'application/json'},
        body: JSON.stringify(user_api_body)
    }
    // console.log(values)
    //console.log(user_api_body)

    await fetch('/api/meal/foodItem', options)
    .then(res => res.json())
    .then((data) => {
      //console.log(data)
      //alert(data.message)
      toast(data.message)
      const updatedFoodItems: FormValues = {
        foodName : formik.values.foodName,
      }
      onSubmit(updatedFoodItems)
    })

  }}

  async function getInitialData(querryData: FormValues) {
    const options = {
      method: "GET",
      headers : { 'Content-Type': 'application/json'},
    }
    await fetch(`/api/meal/getFoodItems?foodName=${querryData.foodName}&limit=20`, options)
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
    .then(data => setFoodItems({ status: 'loaded', payload: data }))
    .catch(err => {setFoodItems({ status: 'error', error: err.message})});
  }

  useEffect(() => {
    getInitialData({foodName: ''}) 
  },[])

  async function onSubmit (values: FormValues){
    getInitialData({foodName: values.foodName})
  }

  const initialValues: FormValues = {
    foodName : '',
  }

  const validationSchemaYup: Yup.SchemaOf<FormValues> = Yup.object().shape({
    foodName: Yup.string().required('Food name required').min(2, "The name must have at least 2 characters!")
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

      <Head>
        <title>Upate Food Item</title>
      </Head>
      
      <section className='min-w-[250px] max-w-[320px] md:max-w-[900px] items-center mx-auto flex flex-col gap-3 mt-4 md:mt-8'> 
        <div className="flex justify-start">
            <p className='font-bold md:text-xl'>Update Food Items</p>
        </div>

        <form className='flex flex-row items-center gap-3 md:gap-5' onSubmit={formik.handleSubmit}>
          <div className={`${styles.input_group} ${formik.errors.foodName && formik.touched.foodName ? 'border-rose-600' : ''}`}>
            <input 
            type="text"
            name='foodName'
            placeholder='foodName'
            className={styles.input_text}
            {...formik.getFieldProps('foodName')}
            />
          </div>
          <div className="min-w-[20px] ">
            <button type='submit' className={`${styles.button} `}>
              <span className="hidden md:inline ml-4 mr-4">Search</span>
              <FontAwesomeIcon icon={faSearch} className="w-5 h-5  ml-2 mr-2 pt-1 md:hidden" aria-hidden="true" />
            </button>
          </div>
        </form>

        <div className='flex flex-col'>
          {foodItems.status === 'loading' && <div>Loading...</div>}
          {foodItems.status === 'loaded' && 
            foodItems.payload.results.map((food, index) => (
              <div key={index} className={`flex justify-between items-center gap-3 py-1 md:py-2`}>
                <div className='flex items-center gap-3'>
                  <Image
                    className={`avatar_small_global border-2 flex justify-start`}
                    cloudName={process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}
                    publicId={food.image}
                    alt={food.image}
                    secure
                    dpr="auto"
                    quality="auto"
                    width={350}
                    height={350}
                    crop="fill"
                    gravity="auto"
                  />

                  <div className={`max-h[350] text-left  max-w-[160px] md:max-w-[300px] leading-tight`}>
                    <p className="whitespace-nowrap text-xs md:text-sm font-bold truncate">{food.privateBool ? "Private" : "Public"}</p>
                    <p className="text-left text-sm md:text-lg -mt-1 md:-mt-0 whitespace-nowrap truncate">{food.name}</p>
                  </div>
                  {/*  <div className='mx-4'>Measuring unit: {food.foodMeasureUnit}</div>
                  <div className='mx-4'>Private: {food.privateBool ? "true" : "false"}</div>
                  <div className='mx-4'>ID: {food._id as unknown as string}</div>
                  <div className='mx-4'>Image: {food.image}</div>
                  <div className='mx-4'>Diet: {food.diet.map((diet, index) => `${diet} `)}</div> */}
                </div>

                <span className="h-[24px] md:h-full flex justify-end">
                  <div className="px-1 md:px-2">
                    <button onClick={() => router.push(`/meal/foodItemNewFrom/${food.name}`)}
                    className={`${styles.button_no_bg} whitespace-nowrap bg-gradient-to-r from-cyan-400 to-cyan-500 `}>
                      <span className="ml-2 md:ml-4 mr-2 md:mr-4">New</span>
                    </button>
                  </div>

                  <div className="min-w-[20px] h-full px-1 md:px-2">
                    <button onClick={() => router.push(`/meal/${food.name}`)}
                    className={`${styles.button_no_bg} bg-gradient-to-r from-blue-500 to-blue-600`}>
                      <span className="hidden md:inline ml-4 mr-4">Edit</span>
                      <FontAwesomeIcon icon={faEdit} className="w-3 h-full  ml-1 mr-1 pb-[2px] md:hidden" aria-hidden="true" />
                    </button>
                  </div>

                  <div className="min-w-[20px] px-1 md:px-2">
                    <button onClick={handleUserDelete(food.name)}
                    className={`${styles.button_no_bg} bg-gradient-to-r from-red-500 to-red-600`}>
                      <span className="hidden md:inline ml-4 mr-4">Delete</span>
                      <FontAwesomeIcon icon={faTrash} className="w-3 h-3  ml-1 mr-1 md:hidden" aria-hidden="true" />
                    </button>
                  </div>
                </span>
              </div>
            ))
          }
          {foodItems.status === 'error' && (
            <div>{foodItems.error}</div>
          )}
        </div>

      </section>
      
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
