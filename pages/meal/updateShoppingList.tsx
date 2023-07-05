import { useFormik } from "formik";
import { useEffect, useState } from "react";
import Layout from "../../components/layout";
import { IWeeklyPlan } from "../../models/WeeklyPlan";
import * as Yup from "yup";
import styles from "../../styles/Form.module.css";
import { useRouter } from "next/router";
import { getISOWeek, startOfWeek, endOfWeek, format, addWeeks } from "date-fns";
import Head from "next/head";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faEye, faSearch } from "@fortawesome/free-solid-svg-icons";

interface FormValues {
  year: number;
  weekNr: number;
  limit: number;
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

interface IWeeklyPlans {
  results: IWeeklyPlan[];
}

export default function UpdateShoppingList() {
  const [weeklyPlans, setWeeklyPlans] = useState<Service<IWeeklyPlans>>({
    status: "loading",
  });

  const router = useRouter();

  async function getInitialData(querryData: FormValues) {
    const options = {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    };
    await fetch(
      `/api/meal/getWeeklyPlan?year=${querryData.year}&weekNr=${querryData.weekNr}&limit=${querryData.limit}`,
      options
    )
      .then(async (response) => {
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error);
        } else {
          return response.json();
        }
      })
      .then((data) => {
        setWeeklyPlans({ status: "loaded", payload: data });
        console.log(data);
      })
      .catch((err) => {
        setWeeklyPlans({ status: "error", error: err.message });
      });
  }

  function getWeekNr(): number {
    const now: Date = new Date();
    const weekNumber: number = getISOWeek(now);

    return weekNumber;
  }
  const currentYear = new Date().getFullYear();
  const currentWeekNr = getWeekNr();

  function generateDatesFromWkNumber(weekNumbers, currentYear) {
    const startDate = getStartDateOfWeek(weekNumbers, currentYear);
    const endDate = getEndDateOfWeek(startDate);

    const startDateFormatted = formatDate(startDate);
    const endDateFormatted = formatDate(endDate);

    const label = `${startDateFormatted} - ${endDateFormatted}`;

    return label;
  }

  function getStartDateOfWeek(weekNr, year) {
    const januaryFirst = new Date(year, 0, 1);
    const startOfWeekISO = startOfWeek(januaryFirst, { weekStartsOn: 1 });

    return addWeeks(startOfWeekISO, weekNr);
  }

  function getEndDateOfWeek(startDate) {
    return endOfWeek(startDate, { weekStartsOn: 1 });
  }

  function formatDate(date) {
    return format(date, "dd/MM/yyyy");
  }

  useEffect(() => {
    getInitialData({ year: currentYear, weekNr: currentWeekNr + 4, limit: 10 });
  }, []);

  async function onSubmit(values: FormValues) {
    getInitialData({ year: values.year, weekNr: values.weekNr, limit: 1 });
  }

  const initialValues: FormValues = {
    year: currentYear,
    weekNr: currentWeekNr,
    limit: 1,
  };

  const validationSchemaYup: Yup.SchemaOf<FormValues> = Yup.object().shape({
    year: Yup.number().required("Year is required"),
    weekNr: Yup.number().required("Week nr is required"),
    limit: Yup.number().required("Limit is required"),
  });

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: validationSchemaYup,
    onSubmit,
  });

  return (
    <Layout>
      <Head>
        <title>Shopping List Update</title>
      </Head>

      <section className="min-w-[250px] max-w-[320px] md:max-w-[900px] items-center mx-auto flex flex-col gap-3 mt-4 md:mt-8">
        <div className="flex justify-start">
          <p className="font-bold md:text-xl">Update Shopping List</p>
        </div>

        <form
          className="flex flex-row items-center justify-between bg-green-100 border rounded-xl gap-1 md:gap-1.5"
          onSubmit={formik.handleSubmit}
        >
          <label className="ml-3">Year: </label>
          <input
            type="number"
            name="year"
            placeholder="Current Year"
            className={`w-[60px] md:w-[70px] border text-center rounded-lg h-8 md:h-9 bg-white text-sm md:text-base pl-1 md:pl-2 pr-0
          ${
            formik.errors.year && formik.touched.year ? "border-rose-600" : ""
          }`}
            {...formik.getFieldProps("year")}
          />

          <label className="ml-1 md:ml-2">Week: </label>

          <input
            type="number"
            name="weekNr"
            placeholder="Current Week number"
            className={`w-[50px] md:w-[60px] border text-center rounded-lg h-8 md:h-9 bg-white text-sm md:text-base pl-1 md:pl-2 pr-0
          ${
            formik.errors.weekNr && formik.touched.weekNr
              ? "border-rose-600"
              : ""
          }`}
            {...formik.getFieldProps("weekNr")}
          />

          <div className="min-w-[20px] my-1.5 md:my-2 mr-2 md:mr-3 ml-1 md:ml-2">
            <button type="submit" className={`${styles.button} `}>
              <span className="hidden md:inline ml-4 mr-4">Search</span>
              <FontAwesomeIcon
                icon={faSearch}
                className="w-3.5 h-3.5 ml-2 mr-2 pt-1 md:hidden"
                aria-hidden="true"
              />
            </button>
          </div>
        </form>
        <div className="flex flex-col">
          {weeklyPlans.status === "loading" && <div>Loading...</div>}
          {weeklyPlans.status === "loaded" &&
            weeklyPlans.payload.results.map((weeklyPlan, index) => (
              <div
                key={index}
                className={`flex justify-between items-center gap-1 md:gap-3 py-1 md:py-2`}
              >
                <div className="flex justify-start items-center gap-1.5 md:gap-3 text-xs md:text-base">
                  <div>Year: {weeklyPlan.year}</div>
                  <div className="">Week: {weeklyPlan.weekNr}</div>
                  <div className="text-[9px] md:text-sm">
                    {generateDatesFromWkNumber(
                      weeklyPlan.weekNr,
                      weeklyPlan.year
                    )}
                  </div>
                </div>

                <span className="h-[24px] md:h-full flex justify-end items-center">
                  <div
                    className={`${
                      weeklyPlan.weekNr < currentWeekNr ? "hidden" : "block"
                    } min-w-[20px] md:w-[90px] h-full px-1 md:px-2`}
                  >
                    <button
                      onClick={() =>
                        router.push(`/meal/shoppingListEdit/${weeklyPlan._id}`)
                      }
                      className={`${styles.button_no_bg} bg-gradient-to-r from-green-400 to-green-500`}
                    >
                      <span className="hidden md:inline ml-4 mr-4">Edit</span>
                      <FontAwesomeIcon
                        icon={faEdit}
                        className="w-3 h-full  ml-1 mr-1 pb-[2px] md:hidden"
                        aria-hidden="true"
                      />
                    </button>
                  </div>

                  <div
                    className={`${
                      weeklyPlan.weekNr < currentWeekNr ? "block" : "hidden"
                    } min-w-[20px] md:w-[90px] h-full px-1 md:px-2`}
                  >
                    <button
                      onClick={() =>
                        router.push(`/meal/shoppingListView/${weeklyPlan._id}`)
                      }
                      className={`${styles.button_no_bg} bg-gradient-to-r from-blue-500 to-blue-600`}
                    >
                      <span className="hidden md:inline ml-4 mr-4">View</span>
                      <FontAwesomeIcon
                        icon={faEye}
                        className="w-3 h-full ml-1 mr-1 pb-[2px] md:hidden"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </span>
              </div>
            ))}
          {weeklyPlans.status === "error" && <div>{weeklyPlans.error}</div>}
        </div>
      </section>
    </Layout>
  );
}