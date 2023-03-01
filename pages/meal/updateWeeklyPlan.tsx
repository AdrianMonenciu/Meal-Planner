import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { toast } from "react-toastify"
import Layout from "../../components/layout"
import { IUser } from '../../models/user'
import { IWeeklyPlan } from '../../models/WeeklyPlan'
import * as Yup from "yup";
import styles from '../../styles/Form.module.css';
import { useRouter } from "next/router";

interface FormValues {
  year: number;
  weekNr: number;
  limit: number
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

interface IWeeklyPlans {
  results: IWeeklyPlan[];
}

interface Idelete {
  name: string;
}


export default function ApiExamplePage() {
  const [weeklyPlans, setWeeklyPlans] = useState<Service<IWeeklyPlans>>({status: 'loading'})

  const router = useRouter()

  async function getInitialData(querryData: FormValues) {
    const options = {
      method: "GET",
      headers : { 'Content-Type': 'application/json'},
    }
    await fetch(`/api/meal/getWeeklyPlan?year=${querryData.year}&weekNr=${querryData.weekNr}&limit=${querryData.limit}`, options)
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
    .then(data => {setWeeklyPlans({ status: 'loaded', payload: data })
      console.log(data)
    })
    .catch(err => {setWeeklyPlans({ status: 'error', error: err.message})});
  }

  function getWeekNr() {
    const now: Date = new Date();
    const onejan: Date = new Date(now.getFullYear(), 0, 1);
    const weekNumber: number = Math.ceil((((now.valueOf() - onejan.valueOf()) / 86400000) + onejan.getDay() + 1) / 7) ?? 0;

    return weekNumber;
}
  const currentYear=  new Date().getFullYear()
  const currentWeekNr = getWeekNr();

  useEffect(() => {
    getInitialData({year: currentYear, weekNr: currentWeekNr + 4, limit: 10}) 
  },[])

  async function onSubmit (values: FormValues){
    getInitialData({year: values.year, weekNr: values.weekNr, limit: 1})
  }

  const initialValues: FormValues = {
    year : currentYear,
    weekNr: currentWeekNr,
    limit: 1
  }

  const validationSchemaYup: Yup.SchemaOf<FormValues> = Yup.object().shape({
    year: Yup.number().required('Year is required'),
    weekNr: Yup.number().required('Week nr is required'),
    limit: Yup.number().required('Limit is required'),
    });

  const formik = useFormik({
    initialValues: initialValues,
    //validate: registerValidate,
    validationSchema: validationSchemaYup,
    onSubmit
})

  return (
    <Layout>
      <h1>Weekly Plan List</h1>
      <form className='flex flex-col' onSubmit={formik.handleSubmit}>
        <div className={`${styles.input_group} ${formik.errors.year && formik.touched.year ? 'border-rose-600' : ''}`}>
          <input 
          type="number"
          name='year'
          placeholder='Current Year'
          className={styles.input_text}
          {...formik.getFieldProps('year')}
          />
        </div>
        <div className={`${styles.input_group} ${formik.errors.year && formik.touched.year ? 'border-rose-600' : ''}`}>
          <input 
          type="number"
          name='weekNr'
          placeholder='Current Week number'
          className={styles.input_text}
          {...formik.getFieldProps('weekNr')}
          />
        </div>
        <div className="input-button">
          <button type='submit' className={styles.button}>
              Search
          </button>
        </div>
      </form>
      <div className='flex flex-col'>
        {weeklyPlans.status === 'loading' && <div>Loading...</div>}
        {weeklyPlans.status === 'loaded' && 
          weeklyPlans.payload.results.map((weeklyPlan, index) => (
            <div key={index} className={`flex justify-between`}>
              <div className="flex justify-start">
                <div>Year: {weeklyPlan.year}</div>
                <div className='mx-4'>Week Number: {weeklyPlan.weekNr}</div>
              </div>
              <span className="flex justify-end">
                <button onClick={() => router.push(`/meal/weeklyPlanEdit/${weeklyPlan._id}`)} className='bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded m-2'> 
                  EDIT
                </button>
                <button onClick={() => router.push(`/meal/weeklyPlanEdit/${weeklyPlan._id}`)} className={`bg-red-400 hover:bg-red-700 text-white font-bold py-2 px-4 rounded m-2`}> 
                  EDIT SHOPPING LIST
                </button>
                <button onClick={() => router.push(`/meal/weeklyPlanEdit/${weeklyPlan._id}`)} className='bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded m-2'> 
                  VIEW
                </button>
              </span>
            </div>
          ))
        }
        {weeklyPlans.status === 'error' && (
          <div>{weeklyPlans.error}</div>
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
