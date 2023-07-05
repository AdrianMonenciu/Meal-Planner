import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Layout from "../../components/layout";
import { IMeal } from "../../models/Meal";
import * as Yup from "yup";
import styles from "../../styles/Form.module.css";
import { useRouter } from "next/router";
import Head from "next/head";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faSearch, faTrash } from "@fortawesome/free-solid-svg-icons";
import { Image } from "cloudinary-react";
import { useSession } from "next-auth/react";

interface FormValues {
  mealName: string;
}

interface ServiceInit {
  status: "init";
}
interface ServiceLoading {
  status: "loading";
}
interface ServiceLoaded<T> {
  status: "loaded";
  payload: T;
}
interface ServiceError {
  status: "error";
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

export default function UpdateMeals() {
  const [meals, setMeals] = useState<Service<IFoodItems>>({
    status: "loading",
  });

  const { data: session, status } = useSession();

  const router = useRouter();

  function handleUserDelete(name: string) {
    return async (event: React.MouseEvent) => {

      const meal_delete_api_body: Idelete = {
        name: name,
      };
      const options = {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(meal_delete_api_body),
      };

      await fetch("/api/meal/meal", options)
        .then((res) => res.json())
        .then((data) => {
          toast(data.message);
          const updatedFoodItems: FormValues = {
            mealName: formik.values.mealName,
          };
          onSubmit(updatedFoodItems);
        });
    };
  }

  async function getInitialData(querryData: FormValues) {
    const options = {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    };
    await fetch(
      `/api/meal/getMeals?mealName=${querryData.mealName}&limit=20&username=${session.user.username}`,
      options
    )
      .then(async (response) => {
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error);
        } else {
          return await response.json();
        }
      })
      .then((data) => {
        setMeals({ status: "loaded", payload: data });
      })
      .catch((err) => {
        setMeals({ status: "error", error: err.message });
      });
  }

  useEffect(() => {
    getInitialData({ mealName: "" });
  }, []);

  async function onSubmit(values: FormValues) {
    getInitialData({ mealName: values.mealName });
  }

  const initialValues: FormValues = {
    mealName: "",
  };

  const validationSchemaYup: Yup.SchemaOf<FormValues> = Yup.object().shape({
    mealName: Yup.string()
      .required("Meal name required")
      .min(2, "The name must have at least 2 characters!")
      .max(20, "The name must have maximum 20 characters!")
      .test("Empty space", "Name can not start with SPACE!", function (value) {
        if (value) return !(value.charAt(0) === " ");
        else return true;
      }),
  });

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: validationSchemaYup,
    onSubmit,
  });

  return (
    <Layout>
      <Head>
        <title>Upate Meals</title>
      </Head>

      <section className="min-w-[250px] max-w-[320px] md:max-w-[900px] items-center mx-auto flex flex-col gap-3 mt-4 md:mt-8">
        <div className="flex justify-start">
          <p className="font-bold md:text-xl">Update Meals</p>
        </div>

        <form
          className="flex flex-row items-center gap-3 md:gap-5"
          onSubmit={formik.handleSubmit}
        >
          <div
            className={`${styles.input_group} ${
              formik.errors.mealName && formik.touched.mealName
                ? "border-rose-600"
                : ""
            }`}
          >
            <input
              type="text"
              name="mealName"
              placeholder="Meal Name"
              className={styles.input_text}
              {...formik.getFieldProps("mealName")}
            />
          </div>
          <div className="min-w-[20px] ">
            <button type="submit" className={`${styles.button} `}>
              <span className="hidden md:inline ml-4 mr-4">Search</span>
              <FontAwesomeIcon
                icon={faSearch}
                className="w-5 h-5  ml-2 mr-2 pt-1 md:hidden"
                aria-hidden="true"
              />
            </button>
          </div>
        </form>

        <div className="flex flex-col">
          {meals.status === "loading" && <div>Loading...</div>}
          {meals.status === "loaded" &&
            meals.payload.results.map((meal, index) => (
              <div
                key={index}
                className={`flex justify-between items-center gap-3 py-1 md:py-2`}
              >
                <div className="flex items-center gap-3">
                  <Image
                    className={`avatar_small_global border-2 flex justify-start`}
                    cloudName={process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}
                    publicId={meal.image}
                    alt={meal.image}
                    secure
                    dpr="auto"
                    quality="auto"
                    width={350}
                    height={350}
                    crop="fill"
                    gravity="auto"
                  />

                  <div
                    className={`max-h[350] text-left  max-w-[160px] md:max-w-[300px] leading-tight`}
                  >
                    <p className="whitespace-nowrap text-xs md:text-sm font-bold truncate">
                      {meal.privateBool ? "Private" : "Public"}
                    </p>
                    <p className="text-left text-sm md:text-lg -mt-1 md:-mt-0 whitespace-nowrap truncate">
                      {meal.name}
                    </p>
                  </div>
                </div>

                <span className="h-[24px] md:h-full flex justify-end">
                  <div className="px-1 md:px-2">
                    <button
                      onClick={() =>
                        router.push(`/meal/mealNewFrom/${meal.name}`)
                      }
                      className={`${styles.button_no_bg} whitespace-nowrap bg-gradient-to-r from-cyan-400 to-cyan-500 `}
                    >
                      <span className="ml-2 md:ml-4 mr-2 md:mr-4">New</span>
                    </button>
                  </div>

                  <div className="min-w-[20px] h-full px-1 md:px-2">
                    <button
                      onClick={() => router.push(`/meal/mealEdit/${meal.name}`)}
                      className={`${styles.button_no_bg} bg-gradient-to-r from-blue-500 to-blue-600`}
                    >
                      <span className="hidden md:inline ml-4 mr-4">Edit</span>
                      <FontAwesomeIcon
                        icon={faEdit}
                        className="w-3 h-full  ml-1 mr-1 pb-[2px] md:hidden"
                        aria-hidden="true"
                      />
                    </button>
                  </div>

                  <div className="min-w-[20px] px-1 md:px-2">
                    <button
                      onClick={handleUserDelete(meal.name)}
                      className={`${styles.button_no_bg} bg-gradient-to-r from-red-500 to-red-600`}
                    >
                      <span className="hidden md:inline ml-4 mr-4">Delete</span>
                      <FontAwesomeIcon
                        icon={faTrash}
                        className="w-3 h-3  ml-1 mr-1 md:hidden"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </span>
              </div>
            ))}
          {meals.status === "error" && <div>{meals.error}</div>}
        </div>
      </section>
    </Layout>
  );
}