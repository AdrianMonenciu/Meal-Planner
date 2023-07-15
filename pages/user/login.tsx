import Head from 'next/head';
import Link from 'next/link';
import styles from '../../styles/Form.module.css';
import { HiAtSymbol, HiFingerPrint } from 'react-icons/hi';
import { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useFormik } from 'formik';
import { useRouter } from 'next/router';
import Layout from '../../components/layout';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Login() {
  const { data } = useSession();

  interface FormValues {
    email: string;
    password: string;
  }

  const initialValues: FormValues = {
    email: '',
    password: ''
  };

  const [show, setShow] = useState(false);
  const router = useRouter();
  const formik = useFormik({
    initialValues: initialValues,
    onSubmit
  });

  async function onSubmit(values: FormValues) {
    const status = await signIn('credentials', {
      redirect: false,
      email: values.email,
      password: values.password,
      callbackUrl: 'http://localhost:3000/'
    }).then(({ ok, error }) => {
      if (ok) {
        toast.success(`Logged in as ${values.email}`);
        router.push('/');
      } else {
        toast.error(error);
      }
    });
  }

  return (
    <Layout>
      {data ? (
        <div> Already signed in as: {JSON.stringify(data.user.username, null, 2)} </div>
      ) : (
        <div>
          <Head>
            <title>Login</title>
          </Head>
          <ToastContainer toastClassName="toast-custom-class" />

          <section className="min-w-[250px] max-w-[320px] md:max-w-[500px] items-center mx-auto flex flex-col gap-3 mt-4 md:mt-8">
            <div className="flex justify-start">
              <p className="font-bold md:text-xl">Login with your email and password: </p>
            </div>

            <form className="flex flex-col gap-5 items-center" onSubmit={formik.handleSubmit}>
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
                <span className="text-rose-500 text-sm py-0">{formik.errors.email}</span>
              ) : (
                <></>
              )}

              <div
                className={`${styles.input_group} ${
                  formik.errors.password && formik.touched.password ? 'border-rose-600' : ''
                }`}>
                <input
                  type={`${show ? 'text' : 'password'}`}
                  name="password"
                  placeholder="password"
                  className={styles.input_text}
                  {...formik.getFieldProps('password')}
                />
                <span className="icon flex items-center px-4" onClick={() => setShow(!show)}>
                  <HiFingerPrint size={25} />
                </span>
              </div>

              {formik.errors.password && formik.touched.password ? (
                <span className="text-rose-500 text-sm py-0">{formik.errors.password}</span>
              ) : (
                <></>
              )}

              <div className="min-w-[120px] max-w-[150px]">
                <button type="submit" className={styles.button}>
                  Login
                </button>
              </div>
            </form>

            <p className="text-center text-gray-400 ">
              don&apos;t have an account yet?{' '}
              <Link href={'/register'} className="text-green-500">
                Sign Up
              </Link>
            </p>
          </section>
        </div>
      )}
    </Layout>
  );
}
