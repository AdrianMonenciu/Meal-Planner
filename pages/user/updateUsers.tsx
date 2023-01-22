import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { toast } from "react-toastify"
import Layout from "../../components/layout"
import { IUser } from '../../models/user'
import * as Yup from "yup";
import styles from '../../styles/Form.module.css';

interface FormValues {
  username: string;
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

interface IUsers {
  results: IUser[];
}


export default function ApiExamplePage() {
  const [users, setUsers] = useState<Service<IUsers>>({status: 'loading'})

  function handleUserRole(username: string, userRole: string ) { //username: string, userRole: string  
    return (event: React.MouseEvent) => {
    const updatedRole = userRole == "admin" ? "user" : "admin"
    toast(`User: ${username} will be updated userRole: ${updatedRole}`)
  }}

  function handleUserDelete(username: string) { //username: string, userRole: string  
    return (event: React.MouseEvent) => {
    toast(`User: ${username} will be deleted!`)
  }}

  async function getInitialData(querryData: FormValues) {
    const options = {
      method: "GET",
      headers : { 'Content-Type': 'application/json'},
    }
    await fetch(`/api/user/getUsers?username=${querryData.username}&limit=20`, options)
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
    .then(data => setUsers({ status: 'loaded', payload: data }))
    .catch(err => {setUsers({ status: 'error', error: err.message})});
  }

  useEffect(() => {
    getInitialData({username: ''}) 
  },[])

  async function onSubmit (values: FormValues){
    getInitialData({username: values.username})
  }

  const initialValues: FormValues = {
    username : '',
  }

  const validationSchemaYup: Yup.SchemaOf<FormValues> = Yup.object().shape({
    username: Yup.string().required('Username required')
      .test("Empty space", "Invalid username, spaces not allowed!", function(value) {if (value) return !value.includes(" "); else return true }),
  });

  const formik = useFormik({
    initialValues: initialValues,
    //validate: registerValidate,
    validationSchema: validationSchemaYup,
    onSubmit
})

  return (
    <Layout>
      <h1>User list</h1>
      <form className='flex flex-col' onSubmit={formik.handleSubmit}>
        <div className={`${styles.input_group} ${formik.errors.username && formik.touched.username ? 'border-rose-600' : ''}`}>
          <input 
          type="text"
          name='Username'
          placeholder='Username'
          className={styles.input_text}
          {...formik.getFieldProps('username')}
          />
        </div>
        <div className="input-button">
          <button type='submit' className={styles.button}>
              Search
          </button>
        </div>
      </form>
      <div className='flex flex-col'>
        {users.status === 'loading' && <div>Loading...</div>}
        {users.status === 'loaded' && 
          users.payload.results.map((user, index) => (
            <div key={index} className={`flex justify-between`}>
              <div className="flex justify-start">
                <div>Username: {user.username}</div>
                <div className='mx-4'>User role: {user.userRole}</div>
              </div>
              <span className="flex justify-end">
                  <button onClick={handleUserRole(user.username, user.userRole)} className='bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded m-2'> 
                    Change role to: {user.userRole == 'user' ? 'ADMIN' : 'USER'}</button>
                  <button onClick={handleUserDelete(user.username)} className={`bg-red-400 hover:bg-red-700 text-white font-bold py-2 px-4 rounded m-2`}> 
                    DELETE USER</button>
                </span>
            </div>
          ))
        }
        {users.status === 'error' && (
          <div>{users.error}</div> //{users.error}
        )}
      </div>
      
    </Layout>
  )
}

//<pre>{JSON.stringify(users, null, 2)}</pre>

// {users && service.payload.results.map((user, index) => (
//   <div key={index}>{JSON.stringify(user.username, null, 2)}</div>))}


// users.payload.results.map((user, index) => (
//   <>
//     <div key={index}>{user.username}</div>
//     <pre>{JSON.stringify(user, null, 2)}</pre>
//   </>
// ))
