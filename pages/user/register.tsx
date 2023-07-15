import Head from 'next/head';
import Link from 'next/link';
import styles from '../../styles/Form.module.css';
import { HiAtSymbol, HiFingerPrint, HiOutlineUser } from 'react-icons/hi';
import { useState } from 'react';
import { useFormik } from 'formik';
import router from 'next/router';
import Layout from '../../components/layout';
import { dietPreferences } from '../../lib/dietPreference';
import * as Yup from 'yup';
import { toast } from 'react-toastify';

async function uploadImage(image: File | string) {
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

export default function Register() {
  const [previewImage, setPreviewImage] = useState<string>();

  interface FormValues {
    username: string;
    email: string;
    noDiet: boolean;
    dietPreference: string[];
    password: string;
    cpassword?: string;
    image?: File | string;
  }

  interface IApiBody extends FormValues {
    public_id: string;
  }

  const initialValues: FormValues = {
    username: '',
    email: '',
    noDiet: false,
    dietPreference: [],
    password: '',
    cpassword: '',
    image: null
  };

  const SUPPORTED_FORMATS: string[] = ['image/jpg', 'image/png', 'image/jpeg', 'image/gif'];

  const validationSchemaYup: Yup.SchemaOf<FormValues> = Yup.object().shape({
    username: Yup.string()
      .required('Username required')
      .test('Empty space', 'Invalid username, spaces not allowed!', function (value) {
        if (value) return !value.includes(' ');
        else return true;
      }),
    email: Yup.string().email().required('Email required'),
    noDiet: Yup.bool().required(),
    dietPreference: Yup.array(Yup.string()).min(1, 'Select at least 1 diet requirement!'),
    password: Yup.string()
      .required('Password required')
      .min(8, 'Password must be min 8 characters')
      .max(20, 'Password must be max 20 characters')
      .test('Empty space', 'Invalid password, spaces not allowed!', function (value) {
        if (value) return !value.includes(' ');
        else return true;
      }),
    cpassword: Yup.string()
      .required('Confirm password required')
      .test('Confirm password', "Password doesn't match!", function (item) {
        return this.parent.password == this.parent.cpassword;
      })
      .test('Empty space', 'Invalid password, spaces not allowed!', function (value) {
        if (value) return !value.includes(' ');
        else return true;
      }),
    image: Yup.mixed()
      .nullable()
      .required('Image is required!')
      .test(
        'size',
        'File size is too big',
        value => value && value.size <= 1024 * 1024 // 5MB
      )
      .test(
        'type',
        'Invalid file format selection',
        value => !value || (value && SUPPORTED_FORMATS.includes(value?.type))
      )
  });

  const [show, setShow] = useState({ password: false, cpassword: false });
  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: validationSchemaYup,
    onSubmit
  });

  async function onSubmit(values: FormValues) {
    const response = await uploadImage(values.image);

    if (response.public_id) {
      const user_api_body: IApiBody = {
        username: values.username,
        email: values.email,
        noDiet: values.noDiet,
        dietPreference: values.dietPreference,
        password: values.password,
        public_id: response.public_id as string
      };
      const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user_api_body)
      };

      await fetch('/api/user/register', options)
        .then(res => res.json())
        .then(data => {
          toast(data.message);
          if (data) router.push('/user/login');
        });
    }
  }

  return (
    <Layout>
      <Head>
        <title>Register</title>
      </Head>

      <section className="min-w-[250px] max-w-[320px] md:max-w-[500px] items-center mx-auto flex flex-col gap-3 mt-4 md:mt-8">
        <div className="flex justify-start">
          <p className="font-bold md:text-xl">Register form: </p>
        </div>

        <form className="flex flex-col gap-5 items-center" onSubmit={formik.handleSubmit}>
          <div className="flex flex-col">
            <div
              className={`${styles.input_group} ${
                formik.errors.username && formik.touched.username ? 'border-rose-600' : ''
              }`}>
              <input
                type="text"
                name="Username"
                placeholder="Username"
                className={styles.input_text}
                {...formik.getFieldProps('username')}
              />
              <span className="icon flex items-center px-4">
                <HiOutlineUser size={25} />
              </span>
            </div>
            {formik.errors.username && formik.touched.username ? (
              <span className={`${styles.formikError}`}>{formik.errors.username}</span>
            ) : (
              <></>
            )}
          </div>

          <div className="flex flex-col">
            <div
              className={`${styles.input_group} ${
                formik.errors.email && formik.touched.email ? 'border-rose-600' : ''
              }`}>
              <input
                type="email"
                name="email"
                placeholder="Email"
                className={styles.input_text}
                {...formik.getFieldProps('email')}
              />
              <span className="icon flex items-center px-4">
                <HiAtSymbol size={25} />
              </span>
            </div>
            {formik.errors.email && formik.touched.email ? (
              <span className={`${styles.formikError}`}>{formik.errors.email}</span>
            ) : (
              <></>
            )}
          </div>

          <div
            className={`${styles.input_group} flex-col bg-green-100 
              ${
                formik.errors.dietPreference && formik.touched.dietPreference && !formik.values.noDiet
                  ? 'border-rose-600'
                  : ''
              }`}>
            <div className={`mt-2 ml-1 mb-2 w-full `}>
              <label className="mr-3 font-medium text-sm md:text-base">
                <input
                  type="checkbox"
                  name="noDiet"
                  className={`mr-1`}
                  {...formik.getFieldProps('noDiet')}
                  checked={formik.values.noDiet}
                  onChange={e => {
                    formik.setFieldValue('noDiet', e.target.checked);
                    if (e.target.checked) {
                      formik.setFieldValue('dietPreference', []);
                    }
                  }}
                />
                No dietary restrictions
              </label>
            </div>

            <div className="text-left ml-1 font-medium text-sm md:text-base" id="checkbox-group">
              Dietary restrictions:
            </div>
            <div className={`flex flex-col mb-1`} role="group" aria-labelledby="checkbox-group">
              {dietPreferences.map(diet => (
                <label
                  className={`mr-3 ml-3 mt-1 text-sm md:text-base ${formik.values.noDiet ? 'text-gray-500' : ''}`}
                  key={diet}>
                  <input
                    className={`mr-1`}
                    type="checkbox"
                    name="dietPreference"
                    {...formik.getFieldProps('dietPreference')}
                    value={diet}
                    checked={formik.values.dietPreference.indexOf(diet) > -1 ? true : false}
                    disabled={formik.values.noDiet}
                  />{' '}
                  {diet}{' '}
                </label>
              ))}
            </div>

            {formik.errors.dietPreference && formik.touched.dietPreference && !formik.values.noDiet ? (
              <span className="text-rose-500 mb-1 ml-1 text-sm md:text-base">{formik.errors.dietPreference}</span>
            ) : (
              <></>
            )}
          </div>

          <div className="flex flex-col">
            <div
              className={`${styles.input_group} ${
                formik.errors.password && formik.touched.password ? 'border-rose-600' : ''
              }`}>
              <input
                type={`${show.password ? 'text' : 'password'}`}
                name="password"
                placeholder="Password"
                className={styles.input_text}
                {...formik.getFieldProps('password')}
              />
              <span
                className="icon flex items-center px-4"
                onClick={() => setShow({ ...show, password: !show.password })}>
                <HiFingerPrint size={25} />
              </span>
            </div>
            {formik.errors.password && formik.touched.password ? (
              <span className={`${styles.formikError}`}>{formik.errors.password}</span>
            ) : (
              <></>
            )}
          </div>

          <div className="flex flex-col">
            <div
              className={`${styles.input_group} ${
                formik.errors.cpassword && formik.touched.cpassword ? 'border-rose-600' : ''
              }`}>
              <input
                type={`${show.cpassword ? 'text' : 'password'}`}
                name="cpassword"
                placeholder="Confirm Password"
                className={styles.input_text}
                {...formik.getFieldProps('cpassword')}
              />
              <span
                className="icon flex items-center px-4"
                onClick={() => setShow({ ...show, cpassword: !show.cpassword })}>
                <HiFingerPrint size={25} />
              </span>
            </div>
            {formik.errors.cpassword && formik.touched.cpassword ? (
              <span className={`${styles.formikError}`}>{formik.errors.cpassword}</span>
            ) : (
              <></>
            )}
          </div>

          <div className="flex flex-col">
            <label htmlFor="image" className={`${styles.button} min-w-[150px] max-w-[200px] text-center`}>
              Choose File
            </label>
            <input
              name="image"
              type="file"
              id="image"
              onChange={event => {
                formik.setFieldValue('image', event.target.files[0]);
                if (event?.target?.files?.[0]) {
                  const file = event.target.files[0];
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setPreviewImage(reader.result as string);
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className={'hidden'}></input>

            {formik.errors.image && formik.touched.image ? (
              <span className="text-rose-500 mt-1 ml-1 text-sm md:text-base">{formik.errors.image}</span>
            ) : (
              <></>
            )}
          </div>

          <div>
            {formik.values.image ? (
              <>
                <img src={previewImage} className={`${styles.avatar} `} />
              </>
            ) : (
              'No Image'
            )}
          </div>

          <div className="mt-3 min-w-[150px] max-w-[200px]">
            <button type="submit" className={styles.button}>
              Sign Up
            </button>
          </div>
        </form>

        <p className="text-center text-gray-400 ">
          Have an account?{' '}
          <Link href={'/user/login'} className="text-green-500">
            Sign In
          </Link>
        </p>
      </section>
    </Layout>
  );
}
