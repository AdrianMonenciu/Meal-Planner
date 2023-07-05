import Head from "next/head";
import styles from "../../../styles/Form.module.css";
import { Image } from "cloudinary-react";
import { useEffect, useState } from "react";
import Layout from "../../../components/layout";
import { GetServerSideProps } from "next";
import { IWeeklyPlan } from "../../../models/WeeklyPlan";
import { authOptions } from "../../api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { startOfWeek, endOfWeek, format, addWeeks } from "date-fns";

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

interface IWeklyPlan {
  weeklyPlanData: {
    currentWeeklyPlan: IWeeklyPlan;
    userId: string;
  };
}

interface IShoppingList {
  foodItem: string;
  qty: number;
  qtyOption: string;
  isPurchased: boolean;
  image: string;
}

interface FormValues {
  year: number;
  weekNr: number;
  privateAll: boolean;
  shoppingList: IShoppingList[];
  shoppingListIsUpdated: boolean;
  id: string;
}

export default function UpdateWeeklyPlan(weeklyPlanProps) {
  const [weeklyPlans, setWeeklyPlans] = useState<Service<IWeklyPlan>>({
    status: "loading",
  });

  let currentWeeklyPlan;
  if (weeklyPlanProps.response.status == "loaded") {
    currentWeeklyPlan =
      weeklyPlanProps.response.payload.weeklyPlanData.currentWeeklyPlan[0];
  }

  useEffect(() => {
    if (weeklyPlanProps.response.status == "error") {
      setWeeklyPlans({
        status: "error",
        error: weeklyPlanProps.response.error,
      });
    } else {
      setWeeklyPlans({
        status: "loaded",
        payload: weeklyPlanProps.response.payload,
      });
      console.log(weeklyPlanProps);
    }
  }, []);

  function generateWeekNrOption(weekNr, currentYear) {
    const startDate = getStartDateOfWeek(weekNr, currentYear);
    const endDate = getEndDateOfWeek(startDate);

    const startDateFormatted = formatDate(startDate);
    const endDateFormatted = formatDate(endDate);

    const label = `Week ${weekNr} - ${startDateFormatted} to ${endDateFormatted}`;

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

  const weeklyPlanValues: FormValues = {
    year:
      weeklyPlanProps.response.status == "loaded" ? currentWeeklyPlan.year : 0,
    weekNr:
      weeklyPlanProps.response.status == "loaded"
        ? currentWeeklyPlan.weekNr
        : 0,
    privateAll:
      weeklyPlanProps.response.status == "loaded"
        ? currentWeeklyPlan.privateAll
        : false,

    shoppingList:
      weeklyPlanProps.response.status == "loaded"
        ? currentWeeklyPlan.shoppingList.map((list) => ({
            foodItem: list.foodItem,
            qty: list.qty,
            qtyOption: list.qtyOption,
            isPurchased: list.isPurchased,
            image: list.image,
          }))
        : [
            {
              foodItem: "",
              qty: 0,
              qtyOption: "",
              isPurchased: false,
              image: "",
            },
          ],

    shoppingListIsUpdated: true,
    id:
      weeklyPlanProps.response.status == "loaded" ? currentWeeklyPlan._id : "",
  };

  return (
    <Layout>
      <Head>
        <title>Shopping List</title>
      </Head>

      <section className="w-[320px] md:w-[750px] mx-auto  items-center gap-3 mt-4 md:mt-8">
        <div className="flex justify-center">
          <h1 className="font-bold md:text-xl">Weekly Plan</h1>
        </div>

        {weeklyPlans.status === "loading" && <div>Loading...</div>}
        {weeklyPlans.status === "loaded" && (
          <div className="w-[320px] md:w-[750px] grid grid-rows-10 mx-auto justify-items-center gap-3 mt-4 md:mt-8">
            <div className="w-[320px] md:w-[750px] mb-2 grid grid-cols-1 md:grid-cols-2 md:grid-rows-1 md:gap-x-10 gap-5 justify-around">
              <div className="flex flex-col gap-2 md:col-start-1 md:row-start-1">
                <p
                  className={`text-left ml-1 mt-1 text-sm md:text-base mb-1 font-medium`}
                >
                  Week number:
                </p>

                <div className="pl-1 md:pl-1.5 w-70 mb-0.5 md:mb-0 flex items-center md:w-85 text-sm md:text-base border rounded-lg h-8 md:h-10">
                  {generateWeekNrOption(
                    weeklyPlanValues.weekNr,
                    weeklyPlanValues.year
                  )}
                </div>
              </div>

              <div
                className={`${styles.input_group} flex-col md:col-start-2 md:row-start-1 bg-green-100`}
              >
                <div
                  className={`text-left ml-3 mt-1 text-sm md:text-base mb-1 font-medium`}
                >{` 
                    ${
                      weeklyPlanValues.privateAll
                        ? "All private food items and meals"
                        : "Private food items and miels based on diet"
                    }`}</div>
                <label className={`mr-3 ml-3 mt-1 text-sm md:text-base`}>
                  <input
                    type="radio"
                    name="privateBool"
                    className="mr-1"
                    checked={weeklyPlanValues.privateAll === true}
                    disabled={true}
                  />
                  All private food items and meals
                </label>
                <label className={`mr-3 ml-3 mt-1 mb-1 text-sm md:text-base`}>
                  <input
                    type="radio"
                    name="privateBool"
                    className="mr-1"
                    checked={weeklyPlanValues.privateAll === false}
                    disabled={true}
                  />
                  Only food items and meals based on diet
                </label>
              </div>
            </div>

            <p className="mb-1 md:text-lg font-bold text-left">{`Shopping List`}</p>
            {weeklyPlanValues.shoppingList.map((name, index) => (
              <div
                key={index}
                className={`flex flex-col  w-full ${
                  index < weeklyPlanValues.shoppingList.length - 1 ? "mb-4" : ""
                }`}
              >
                <div className={`flex flex-row items-center `}>
                  <div className="w-16 h-16 ml-1 md:ml-2 flex items-center justify-center">
                    {weeklyPlanValues.shoppingList[index].image ? (
                      <Image
                        className={`${styles.avatar_medium} border-2 flex justify-start`}
                        cloudName={
                          process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
                        }
                        publicId={weeklyPlanValues.shoppingList[index].image}
                        alt={
                          weeklyPlanValues.shoppingList[index].image
                            ? (weeklyPlanValues.shoppingList[index]
                                .image as string)
                            : ""
                        }
                        secure
                        dpr="auto"
                        quality="auto"
                        width={350}
                        height={350}
                        crop="fill"
                        gravity="auto"
                      />
                    ) : (
                      <div className="text-center">No Image</div>
                    )}
                  </div>

                  <div className="flex flex-wrap ml-2 items-center max-w-[245px] md:max-w-none  gap-1 md:flex-row md:gap-4">
                    <div className="flex items-center overflow-hidden pl-2 w-60 mb-0.5 md:mb-0 md:w-80 text-sm md:text-base border rounded-lg h-8 md:h-10 bg-white">
                      <p className="text-center whitespace-nowrap truncate">
                        {weeklyPlanValues.shoppingList[index].foodItem}
                      </p>
                    </div>

                    <div className="flex items-center justify-between w-[159px] md:w-48 border rounded-lg h-8 md:h-10 bg-white text-sm md:text-base">
                      <div className="flex items-center overflow-hidden pl-2 w-20 md:w-24 mb-0.5 md:mb-0 text-sm md:text-base bg-white">
                        <p className="text-center whitespace-nowrap truncate">
                          {weeklyPlanValues.shoppingList[index].qty}
                        </p>
                      </div>
                      <div className="ml-2 mr-2 flex items-center justify-center h-full">
                        {"["}
                        {weeklyPlanValues.shoppingList[index].qtyOption}
                        {"]"}
                      </div>
                    </div>

                    <div className="flex items-center justify-between border rounded-lg h-8 md:h-10 bg-white text-sm md:text-base">
                      <div className="flex items-center overflow-hidden pl-1 text-sm md:text-base bg-white">
                        Bought
                      </div>
                      <input
                        type="checkbox"
                        checked={
                          weeklyPlanValues.shoppingList[index].isPurchased ===
                          true
                        }
                        disabled={true}
                        className="w-4 h-4 md:w-5 md:h-5 ml-1 md:ml-2 mr-1 md:mr-2"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {weeklyPlans.status === "error" && <div>{weeklyPlans.error}</div>}
      </section>
    </Layout>
  );
}

function return_url(context) {
  if (process.env.NODE_ENV === "production") {
    return `https://${context.req.rawHeaders[1]}`;
  } else {
    return "http://localhost:3000";
  }
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  let absoluteUrl = return_url(context);
  const weeklyPlanId = context.params?.weeklyPlanIdShListView as string;
  let responseLoaded: ServiceLoaded<IWeklyPlan> = {
    status: "loaded",
    payload: {
      weeklyPlanData: {
        currentWeeklyPlan: undefined,
        userId: "",
      },
    },
  };

  let responseError;

  async function getWeeklyPlan(weeklyPlanId: string) {
    const options = {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    };
    const url = `${absoluteUrl}/api/meal/getWeeklyPlan?weeklyPlanId=${weeklyPlanId}`;

    await fetch(url, options)
      .then(async (response) => {
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error);
        } else {
          return response.json();
        }
      })
      .then((data) => {
        responseLoaded.payload.weeklyPlanData.currentWeeklyPlan = data.results;
      })
      .catch(
        (err) =>
          (responseError = {
            status: "error",
            error: "Error getting the Weekly Plan!",
          })
      );
  }

  const sessionObj: Session | null = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  );

  responseLoaded.payload.weeklyPlanData.userId = sessionObj.user._id;

  await getWeeklyPlan(weeklyPlanId);

  if (responseError) {
    return {
      props: { response: responseError },
    };
  }

  return {
    props: { response: responseLoaded },
  };
};