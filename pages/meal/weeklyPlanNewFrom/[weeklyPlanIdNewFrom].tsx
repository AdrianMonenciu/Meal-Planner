import Head from "next/head";
import styles from "../../../styles/Form.module.css";
import { Image } from "cloudinary-react";
import { useEffect, useState, useRef, useId } from "react";
import { Field, Form, Formik } from "formik";
import Layout from "../../../components/layout";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { GetServerSideProps } from "next";
import { IFood } from "../../../models/FoodItem";
import { IMeal } from "../../../models/Meal";
import { IWeeklyPlan } from "../../../models/WeeklyPlan";
import WeeklyPlan from "../../../models/WeeklyPlan";
import Select from "react-select";
import { authOptions } from "../../api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { DailyInputFieldArray } from "../../../components/weeklyPlan-SubForm";
import connectMongo from "../../../database/connectdb";
import { getISOWeek, startOfWeek, endOfWeek, format, addWeeks } from "date-fns";

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
    availableFoodItems: IFood[];
    availableFoodItemsAllPrivate: IFood[];
    availableMeals: IMeal[];
    availableMealsAllPrivate: IMeal[];
    diet: string[];
    availableWeekNumbers: number[];
    foodItemsSelectOptions: IfoodAndMealsOptions[];
    foodItemsSelectOptionsAllPrivate: IfoodAndMealsOptions[];
    mealsSelectOptions: IfoodAndMealsOptions[];
    mealsSelectOptionsAllPrivate: IfoodAndMealsOptions[];
    userId: string;
    year: number;
  };
}

interface IfoodItemsForm {
  qty: number;
  name: string;
  qtyOption: string;
  id: string;
  image: string;
}

interface IMealsForm {
  name: string;
  id: string;
  image: string;
}

interface IfoodAndMealsOptions {
  value: string;
  label: string;
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
  diet: string[];
  privateAll: boolean;
  mondayMealsBreakfast: IMealsForm[];
  mondayMealsLunch: IMealsForm[];
  mondayMealsDinner: IMealsForm[];
  mondaySnaks: IfoodItemsForm[];
  tuesdayMealsBreakfast: IMealsForm[];
  tuesdayMealsLunch: IMealsForm[];
  tuesdayMealsDinner: IMealsForm[];
  tuesdaySnaks: IfoodItemsForm[];
  wednesdayMealsBreakfast: IMealsForm[];
  wednesdayMealsLunch: IMealsForm[];
  wednesdayMealsDinner: IMealsForm[];
  wednesdaySnaks: IfoodItemsForm[];
  thursdayMealsBreakfast: IMealsForm[];
  thursdayMealsLunch: IMealsForm[];
  thursdayMealsDinner: IMealsForm[];
  thursdaySnaks: IfoodItemsForm[];
  fridayMealsBreakfast: IMealsForm[];
  fridayMealsLunch: IMealsForm[];
  fridayMealsDinner: IMealsForm[];
  fridaySnaks: IfoodItemsForm[];
  saturdayMealsBreakfast: IMealsForm[];
  saturdayMealsLunch: IMealsForm[];
  saturdayMealsDinner: IMealsForm[];
  saturdaySnaks: IfoodItemsForm[];
  sundayMealsBreakfast: IMealsForm[];
  sundayMealsLunch: IMealsForm[];
  sundayMealsDinner: IMealsForm[];
  sundaySnaks: IfoodItemsForm[];
  shoppingList: IShoppingList[];
  shoppingListIsUpdated: boolean;
  id: string;
}

export default function UpdateWeeklyPlan(weeklyPlanProps) {
  const [weeklyPlans, setWeeklyPlans] = useState<Service<IWeklyPlan>>({
    status: "loading",
  });
  const [weekNrOptions, setWeekNrOptions] = useState([{ value: 0, label: "" }]);
  const [daySelect, setDaySelect] = useState("monday");
  const instanceId = useId();

  const formikRef = useRef<any>();

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
      setWeekNrOptions(
        generateWeekNrOptions(
          weeklyPlanProps.response.payload.weeklyPlanData.availableWeekNumbers,
          weeklyPlanProps.response.payload.weeklyPlanData.year
        )
      );
      setPrivateAll(
        weeklyPlanProps.response.payload.weeklyPlanData.currentWeeklyPlan[0]
          .privateAll
      );
    }
  }, []);

  function getWeekNrOptionLabel(weekNr) {
    const selectedOption = weekNrOptions.find(
      (option) => option.value === weekNr
    );
    return selectedOption ? selectedOption.label : "";
  }

  function generateWeekNrOptions(weekNumbers, currentYear) {
    const weekNrOptions = weekNumbers.map((weekNr) => {
      const startDate = getStartDateOfWeek(weekNr, currentYear);
      const endDate = getEndDateOfWeek(startDate);

      const startDateFormatted = formatDate(startDate);
      const endDateFormatted = formatDate(endDate);

      const label = `Week ${weekNr} - ${startDateFormatted} to ${endDateFormatted}`;

      return { value: weekNr, label };
    });

    return weekNrOptions;
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

  const initialValues: FormValues = {
    year:
      weeklyPlanProps.response.status == "loaded"
        ? weeklyPlanProps.response.payload.weeklyPlanData.year
        : 0,
    weekNr: weekNrOptions ? weekNrOptions[0].value : 0,
    diet:
      weeklyPlanProps.response.status == "loaded"
        ? weeklyPlanProps.response.payload.weeklyPlanData.diet
        : [""],
    privateAll:
      weeklyPlanProps.response.status == "loaded"
        ? currentWeeklyPlan.privateAll
        : false,

    mondayMealsBreakfast:
      weeklyPlanProps.response.status == "loaded"
        ? currentWeeklyPlan.mondayMealsBreakfast.map((meal) => ({
            name: meal.name,
            id: meal._id,
            image: meal.image,
          }))
        : [{ name: "", id: "", image: "" }],

    mondayMealsLunch:
      weeklyPlanProps.response.status == "loaded"
        ? currentWeeklyPlan.mondayMealsLunch.map((meal) => ({
            name: meal.name,
            id: meal._id,
            image: meal.image,
          }))
        : [{ name: "", id: "", image: "" }],

    mondayMealsDinner:
      weeklyPlanProps.response.status == "loaded"
        ? currentWeeklyPlan.mondayMealsDinner.map((meal) => ({
            name: meal.name,
            id: meal._id,
            image: meal.image,
          }))
        : [{ name: "", id: "", image: "" }],

    mondaySnaks:
      weeklyPlanProps.response.status == "loaded"
        ? currentWeeklyPlan.mondaySnaks.map((snack) => ({
            name: snack.foodId.name,
            qty: snack.qty,
            qtyOption: snack.foodId.foodMeasureUnit,
            id: snack.foodId._id,
            image: snack.foodId.image,
          }))
        : [{ name: "", qty: 0, qtyOption: "", id: "", image: "" }],

    tuesdayMealsBreakfast:
      weeklyPlanProps.response.status == "loaded"
        ? currentWeeklyPlan.tuesdayMealsBreakfast.map((meal) => ({
            name: meal.name,
            id: meal._id,
            image: meal.image,
          }))
        : [{ name: "", id: "", image: "" }],

    tuesdayMealsLunch:
      weeklyPlanProps.response.status == "loaded"
        ? currentWeeklyPlan.tuesdayMealsLunch.map((meal) => ({
            name: meal.name,
            id: meal._id,
            image: meal.image,
          }))
        : [{ name: "", id: "", image: "" }],

    tuesdayMealsDinner:
      weeklyPlanProps.response.status == "loaded"
        ? currentWeeklyPlan.tuesdayMealsDinner.map((meal) => ({
            name: meal.name,
            id: meal._id,
            image: meal.image,
          }))
        : [{ name: "", id: "", image: "" }],

    tuesdaySnaks:
      weeklyPlanProps.response.status == "loaded"
        ? currentWeeklyPlan.tuesdaySnaks.map((snack) => ({
            name: snack.foodId.name,
            qty: snack.qty,
            qtyOption: snack.foodId.foodMeasureUnit,
            id: snack.foodId._id,
            image: snack.foodId.image,
          }))
        : [{ name: "", qty: 0, qtyOption: "", id: "", image: "" }],

    wednesdayMealsBreakfast:
      weeklyPlanProps.response.status == "loaded"
        ? currentWeeklyPlan.wednesdayMealsBreakfast.map((meal) => ({
            name: meal.name,
            id: meal._id,
            image: meal.image,
          }))
        : [{ name: "", id: "", image: "" }],

    wednesdayMealsLunch:
      weeklyPlanProps.response.status == "loaded"
        ? currentWeeklyPlan.wednesdayMealsLunch.map((meal) => ({
            name: meal.name,
            id: meal._id,
            image: meal.image,
          }))
        : [{ name: "", id: "", image: "" }],

    wednesdayMealsDinner:
      weeklyPlanProps.response.status == "loaded"
        ? currentWeeklyPlan.wednesdayMealsDinner.map((meal) => ({
            name: meal.name,
            id: meal._id,
            image: meal.image,
          }))
        : [{ name: "", id: "", image: "" }],

    wednesdaySnaks:
      weeklyPlanProps.response.status == "loaded"
        ? currentWeeklyPlan.wednesdaySnaks.map((snack) => ({
            name: snack.foodId.name,
            qty: snack.qty,
            qtyOption: snack.foodId.foodMeasureUnit,
            id: snack.foodId._id,
            image: snack.foodId.image,
          }))
        : [{ name: "", qty: 0, qtyOption: "", id: "", image: "" }],

    thursdayMealsBreakfast:
      weeklyPlanProps.response.status == "loaded"
        ? currentWeeklyPlan.thursdayMealsBreakfast.map((meal) => ({
            name: meal.name,
            id: meal._id,
            image: meal.image,
          }))
        : [{ name: "", id: "", image: "" }],

    thursdayMealsLunch:
      weeklyPlanProps.response.status == "loaded"
        ? currentWeeklyPlan.thursdayMealsLunch.map((meal) => ({
            name: meal.name,
            id: meal._id,
            image: meal.image,
          }))
        : [{ name: "", id: "", image: "" }],

    thursdayMealsDinner:
      weeklyPlanProps.response.status == "loaded"
        ? currentWeeklyPlan.thursdayMealsDinner.map((meal) => ({
            name: meal.name,
            id: meal._id,
            image: meal.image,
          }))
        : [{ name: "", id: "", image: "" }],

    thursdaySnaks:
      weeklyPlanProps.response.status == "loaded"
        ? currentWeeklyPlan.thursdaySnaks.map((snack) => ({
            name: snack.foodId.name,
            qty: snack.qty,
            qtyOption: snack.foodId.foodMeasureUnit,
            id: snack.foodId._id,
            image: snack.foodId.image,
          }))
        : [{ name: "", qty: 0, qtyOption: "", id: "", image: "" }],

    fridayMealsBreakfast:
      weeklyPlanProps.response.status == "loaded"
        ? currentWeeklyPlan.fridayMealsBreakfast.map((meal) => ({
            name: meal.name,
            id: meal._id,
            image: meal.image,
          }))
        : [{ name: "", id: "", image: "" }],

    fridayMealsLunch:
      weeklyPlanProps.response.status == "loaded"
        ? currentWeeklyPlan.fridayMealsLunch.map((meal) => ({
            name: meal.name,
            id: meal._id,
            image: meal.image,
          }))
        : [{ name: "", id: "", image: "" }],

    fridayMealsDinner:
      weeklyPlanProps.response.status == "loaded"
        ? currentWeeklyPlan.fridayMealsDinner.map((meal) => ({
            name: meal.name,
            id: meal._id,
            image: meal.image,
          }))
        : [{ name: "", id: "", image: "" }],

    fridaySnaks:
      weeklyPlanProps.response.status == "loaded"
        ? currentWeeklyPlan.fridaySnaks.map((snack) => ({
            name: snack.foodId.name,
            qty: snack.qty,
            qtyOption: snack.foodId.foodMeasureUnit,
            id: snack.foodId._id,
            image: snack.foodId.image,
          }))
        : [{ name: "", qty: 0, qtyOption: "", id: "", image: "" }],

    saturdayMealsBreakfast:
      weeklyPlanProps.response.status == "loaded"
        ? currentWeeklyPlan.saturdayMealsBreakfast.map((meal) => ({
            name: meal.name,
            id: meal._id,
            image: meal.image,
          }))
        : [{ name: "", id: "", image: "" }],

    saturdayMealsLunch:
      weeklyPlanProps.response.status == "loaded"
        ? currentWeeklyPlan.saturdayMealsLunch.map((meal) => ({
            name: meal.name,
            id: meal._id,
            image: meal.image,
          }))
        : [{ name: "", id: "", image: "" }],

    saturdayMealsDinner:
      weeklyPlanProps.response.status == "loaded"
        ? currentWeeklyPlan.saturdayMealsDinner.map((meal) => ({
            name: meal.name,
            id: meal._id,
            image: meal.image,
          }))
        : [{ name: "", id: "", image: "" }],

    saturdaySnaks:
      weeklyPlanProps.response.status == "loaded"
        ? currentWeeklyPlan.saturdaySnaks.map((snack) => ({
            name: snack.foodId.name,
            qty: snack.qty,
            qtyOption: snack.foodId.foodMeasureUnit,
            id: snack.foodId._id,
            image: snack.foodId.image,
          }))
        : [{ name: "", qty: 0, qtyOption: "", id: "", image: "" }],

    sundayMealsBreakfast:
      weeklyPlanProps.response.status == "loaded"
        ? currentWeeklyPlan.sundayMealsBreakfast.map((meal) => ({
            name: meal.name,
            id: meal._id,
            image: meal.image,
          }))
        : [{ name: "", id: "", image: "" }],

    sundayMealsLunch:
      weeklyPlanProps.response.status == "loaded"
        ? currentWeeklyPlan.sundayMealsLunch.map((meal) => ({
            name: meal.name,
            id: meal._id,
            image: meal.image,
          }))
        : [{ name: "", id: "", image: "" }],

    sundayMealsDinner:
      weeklyPlanProps.response.status == "loaded"
        ? currentWeeklyPlan.sundayMealsDinner.map((meal) => ({
            name: meal.name,
            id: meal._id,
            image: meal.image,
          }))
        : [{ name: "", id: "", image: "" }],

    sundaySnaks:
      weeklyPlanProps.response.status == "loaded"
        ? currentWeeklyPlan.sundaySnaks.map((snack) => ({
            name: snack.foodId.name,
            qty: snack.qty,
            qtyOption: snack.foodId.foodMeasureUnit,
            id: snack.foodId._id,
            image: snack.foodId.image,
          }))
        : [{ name: "", qty: 0, qtyOption: "", id: "", image: "" }],

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

  const validationSchema = Yup.object().shape({
    mondayMealsBreakfast: Yup.array()
      .max(3, "Maximum 3 meals are allowed!")
      .test(
        "one-meal",
        "At least one meal is required for breakfast, lunch, or dinner",
        function (value) {
          return (
            value &&
            (value.length > 0 ||
              this.parent.mondayMealsLunch.length > 0 ||
              this.parent.mondayMealsDinner.length > 0)
          );
        }
      ),
    mondayMealsLunch: Yup.array()
      .max(3, "Maximum 3 meals are allowed!")
      .test(
        "one-meal",
        "At least one meal is required for breakfast, lunch, or dinner",
        function (value) {
          return (
            value &&
            (value.length > 0 ||
              this.parent.mondayMealsBreakfast.length > 0 ||
              this.parent.mondayMealsDinner.length > 0)
          );
        }
      ),
    mondayMealsDinner: Yup.array()
      .max(3, "Maximum 3 meals are allowed!")
      .test(
        "one-meal",
        "At least one meal is required for breakfast, lunch, or dinner",
        function (value) {
          return (
            value &&
            (value.length > 0 ||
              this.parent.mondayMealsBreakfast.length > 0 ||
              this.parent.mondayMealsLunch.length > 0)
          );
        }
      ),
    mondaySnaks: Yup.array()
      .required()
      .min(1, "Min 1 snack required!")
      .max(10, "Maximum 10 snacks are allowed!")
      .of(
        Yup.object().shape({
          qty: Yup.number()
            .typeError("Min qty is 0.1!")
            .required("Min qty is 0.1!")
            .min(0.1, "Min qty is 0.1!"),
        })
      ),
    tuesdayMealsBreakfast: Yup.array()
      .max(3, "Maximum 3 meals are allowed!")
      .test(
        "one-meal",
        "At least one meal is required for breakfast, lunch, or dinner",
        function (value) {
          return (
            value &&
            (value.length > 0 ||
              this.parent.tuesdayMealsLunch.length > 0 ||
              this.parent.tuesdayMealsDinner.length > 0)
          );
        }
      ),
    tuesdayMealsLunch: Yup.array()
      .max(3, "Maximum 3 meals are allowed!")
      .test(
        "one-meal",
        "At least one meal is required for breakfast, lunch, or dinner",
        function (value) {
          return (
            value &&
            (value.length > 0 ||
              this.parent.tuesdayMealsBreakfast.length > 0 ||
              this.parent.tuesdayMealsDinner.length > 0)
          );
        }
      ),
    tuesdayMealsDinner: Yup.array()
      .max(3, "Maximum 3 meals are allowed!")
      .test(
        "one-meal",
        "At least one meal is required for breakfast, lunch, or dinner",
        function (value) {
          return (
            value &&
            (value.length > 0 ||
              this.parent.tuesdayMealsBreakfast.length > 0 ||
              this.parent.tuesdayMealsLunch.length > 0)
          );
        }
      ),
    tuesdaySnaks: Yup.array()
      .required()
      .min(1, "Min 1 snack required!")
      .max(10, "Maximum 10 snacks are allowed!")
      .of(
        Yup.object().shape({
          qty: Yup.number()
            .typeError("Min qty is 0.1!")
            .required()
            .min(0.1, "Min qty is 0.1!"),
        })
      ),
    wednesdayMealsBreakfast: Yup.array()
      .max(3, "Maximum 3 meals are allowed!")
      .test(
        "one-meal",
        "At least one meal is required for breakfast, lunch, or dinner",
        function (value) {
          return (
            value &&
            (value.length > 0 ||
              this.parent.wednesdayMealsLunch.length > 0 ||
              this.parent.wednesdayMealsDinner.length > 0)
          );
        }
      ),
    wednesdayMealsLunch: Yup.array()
      .max(3, "Maximum 3 meals are allowed!")
      .test(
        "one-meal",
        "At least one meal is required for breakfast, lunch, or dinner",
        function (value) {
          return (
            value &&
            (value.length > 0 ||
              this.parent.wednesdayMealsBreakfast.length > 0 ||
              this.parent.wednesdayMealsDinner.length > 0)
          );
        }
      ),
    wednesdayMealsDinner: Yup.array()
      .max(3, "Maximum 3 meals are allowed!")
      .test(
        "one-meal",
        "At least one meal is required for breakfast, lunch, or dinner",
        function (value) {
          return (
            value &&
            (value.length > 0 ||
              this.parent.wednesdayMealsBreakfast.length > 0 ||
              this.parent.wednesdayMealsLunch.length > 0)
          );
        }
      ),
    wednesdaySnaks: Yup.array()
      .required()
      .min(1, "Min 1 snack required!")
      .max(10, "Maximum 10 snacks are allowed!")
      .of(
        Yup.object().shape({
          qty: Yup.number()
            .typeError("Min qty is 0.1!")
            .required()
            .min(0.1, "Min qty is 0.1!"),
        })
      ),
    thursdayMealsBreakfast: Yup.array()
      .max(3, "Maximum 3 meals are allowed!")
      .test(
        "one-meal",
        "At least one meal is required for breakfast, lunch, or dinner",
        function (value) {
          return (
            value &&
            (value.length > 0 ||
              this.parent.thursdayMealsLunch.length > 0 ||
              this.parent.thursdayMealsDinner.length > 0)
          );
        }
      ),
    thursdayMealsLunch: Yup.array()
      .max(3, "Maximum 3 meals are allowed!")
      .test(
        "one-meal",
        "At least one meal is required for breakfast, lunch, or dinner",
        function (value) {
          return (
            value &&
            (value.length > 0 ||
              this.parent.thursdayMealsBreakfast.length > 0 ||
              this.parent.thursdayMealsDinner.length > 0)
          );
        }
      ),
    thursdayMealsDinner: Yup.array()
      .max(3, "Maximum 3 meals are allowed!")
      .test(
        "one-meal",
        "At least one meal is required for breakfast, lunch, or dinner",
        function (value) {
          return (
            value &&
            (value.length > 0 ||
              this.parent.thursdayMealsBreakfast.length > 0 ||
              this.parent.thursdayMealsLunch.length > 0)
          );
        }
      ),
    thursdaySnaks: Yup.array()
      .required()
      .min(1, "Min 1 snack required!")
      .max(10, "Maximum 10 snacks are allowed!")
      .of(
        Yup.object().shape({
          qty: Yup.number()
            .typeError("Min qty is 0.1!")
            .required()
            .min(0.1, "Min qty is 0.1!"),
        })
      ),
    fridayMealsBreakfast: Yup.array()
      .max(3, "Maximum 3 meals are allowed!")
      .test(
        "one-meal",
        "At least one meal is required for breakfast, lunch, or dinner",
        function (value) {
          return (
            value &&
            (value.length > 0 ||
              this.parent.fridayMealsLunch.length > 0 ||
              this.parent.fridayMealsDinner.length > 0)
          );
        }
      ),
    fridayMealsLunch: Yup.array()
      .max(3, "Maximum 3 meals are allowed!")
      .test(
        "one-meal",
        "At least one meal is required for breakfast, lunch, or dinner",
        function (value) {
          return (
            value &&
            (value.length > 0 ||
              this.parent.fridayMealsBreakfast.length > 0 ||
              this.parent.fridayMealsDinner.length > 0)
          );
        }
      ),
    fridayMealsDinner: Yup.array()
      .max(3, "Maximum 3 meals are allowed!")
      .test(
        "one-meal",
        "At least one meal is required for breakfast, lunch, or dinner",
        function (value) {
          return (
            value &&
            (value.length > 0 ||
              this.parent.fridayMealsBreakfast.length > 0 ||
              this.parent.fridayMealsLunch.length > 0)
          );
        }
      ),
    fridaySnaks: Yup.array()
      .required()
      .min(1, "Min 1 snack required!")
      .max(10, "Maximum 10 snacks are allowed!")
      .of(
        Yup.object().shape({
          qty: Yup.number()
            .typeError("Min qty is 0.1!")
            .required()
            .min(0.1, "Min qty is 0.1!"),
        })
      ),
    saturdayMealsBreakfast: Yup.array()
      .max(3, "Maximum 3 meals are allowed!")
      .test(
        "one-meal",
        "At least one meal is required for breakfast, lunch, or dinner",
        function (value) {
          return (
            value &&
            (value.length > 0 ||
              this.parent.saturdayMealsLunch.length > 0 ||
              this.parent.saturdayMealsDinner.length > 0)
          );
        }
      ),
    saturdayMealsLunch: Yup.array()
      .max(3, "Maximum 3 meals are allowed!")
      .test(
        "one-meal",
        "At least one meal is required for breakfast, lunch, or dinner",
        function (value) {
          return (
            value &&
            (value.length > 0 ||
              this.parent.saturdayMealsBreakfast.length > 0 ||
              this.parent.saturdayMealsDinner.length > 0)
          );
        }
      ),
    saturdayMealsDinner: Yup.array()
      .max(3, "Maximum 3 meals are allowed!")
      .test(
        "one-meal",
        "At least one meal is required for breakfast, lunch, or dinner",
        function (value) {
          return (
            value &&
            (value.length > 0 ||
              this.parent.saturdayMealsBreakfast.length > 0 ||
              this.parent.saturdayMealsLunch.length > 0)
          );
        }
      ),
    saturdaySnaks: Yup.array()
      .required()
      .min(1, "Min 1 snack required!")
      .max(10, "Maximum 10 snacks are allowed!")
      .of(
        Yup.object().shape({
          qty: Yup.number()
            .typeError("Min qty is 0.1!")
            .required()
            .min(0.1, "Min qty is 0.1!"),
        })
      ),
    sundayMealsBreakfast: Yup.array()
      .max(3, "Maximum 3 meals are allowed!")
      .test(
        "one-meal",
        "At least one meal is required for breakfast, lunch, or dinner",
        function (value) {
          return (
            value &&
            (value.length > 0 ||
              this.parent.sundayMealsLunch.length > 0 ||
              this.parent.sundayMealsDinner.length > 0)
          );
        }
      ),
    sundayMealsLunch: Yup.array()
      .max(3, "Maximum 3 meals are allowed!")
      .test(
        "one-meal",
        "At least one meal is required for breakfast, lunch, or dinner",
        function (value) {
          return (
            value &&
            (value.length > 0 ||
              this.parent.sundayMealsBreakfast.length > 0 ||
              this.parent.sundayMealsDinner.length > 0)
          );
        }
      ),
    sundayMealsDinner: Yup.array()
      .max(3, "Maximum 3 meals are allowed!")
      .test(
        "one-meal",
        "At least one meal is required for breakfast, lunch, or dinner",
        function (value) {
          return (
            value &&
            (value.length > 0 ||
              this.parent.sundayMealsBreakfast.length > 0 ||
              this.parent.sundayMealsLunch.length > 0)
          );
        }
      ),
    sundaySnaks: Yup.array()
      .required()
      .min(1, "Min 1 snack required!")
      .max(10, "Maximum 10 snacks are allowed!")
      .of(
        Yup.object().shape({
          qty: Yup.number()
            .typeError("Min qty is 0.1!")
            .required()
            .min(0.1, "Min qty is 0.1!"),
        })
      ),
  });

  const [privateAll, setPrivateAll] = useState(false);

  function resetPrivateAll(setFieldValue) {
    setFieldValue("privateAll", privateAll);
    setFieldValue("mondayMealsBreakfast", []);
    setFieldValue("mondayMealsLunch", []);
    setFieldValue("mondayMealsDinner", []);
    setFieldValue("mondaySnaks", []);
    setFieldValue("tuesdayMealsBreakfast", []);
    setFieldValue("tuesdayMealsLunch", []);
    setFieldValue("tuesdayMealsDinner", []);
    setFieldValue("tuesdaySnaks", []);
    setFieldValue("wednesdayMealsBreakfast", []);
    setFieldValue("wednesdayMealsLunch", []);
    setFieldValue("wednesdayMealsDinner", []);
    setFieldValue("wednesdaySnaks", []);
    setFieldValue("thursdayMealsBreakfast", []);
    setFieldValue("thursdayMealsLunch", []);
    setFieldValue("thursdayMealsDinner", []);
    setFieldValue("thursdaySnaks", []);
    setFieldValue("fridayMealsBreakfast", []);
    setFieldValue("fridayMealsLunch", []);
    setFieldValue("fridayMealsDinner", []);
    setFieldValue("fridaySnaks", []);
    setFieldValue("saturdayMealsBreakfast", []);
    setFieldValue("saturdayMealsLunch", []);
    setFieldValue("saturdayMealsDinner", []);
    setFieldValue("saturdaySnaks", []);
    setFieldValue("sundayMealsBreakfast", []);
    setFieldValue("sundayMealsLunch", []);
    setFieldValue("sundayMealsDinner", []);
    setFieldValue("sundaySnaks", []);
  }

  async function onSubmit(values: FormValues, { setFieldValue }) {
    const updatedShoppingList = generateShoppingList(values, setFieldValue);

    const valuesAPI = {
      values: values,
      updatedShoppingList: updatedShoppingList,
    };

    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(valuesAPI),
    };

    await fetch("/api/meal/weeklyPlan", options)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        toast(data.message);
      });
  }

  function generateShoppingList(weeklyPlanValues, setFieldValue) {
    const shoppingList = [];

    // Add items from snaks for each day
    for (const day of Object.keys(weeklyPlanValues)) {
      if (day.endsWith("Snaks")) {
        const snaks = weeklyPlanValues[day];
        for (const snak of snaks) {
          const existingItem = shoppingList.find(
            (item) => item.foodItem === snak.name
          );
          if (existingItem) {
            existingItem.qty += snak.qty;
          } else {
            shoppingList.push({
              foodItem: snak.name,
              qty: snak.qty,
              qtyOption: snak.qtyOption,
              isPurchased: false,
              image: snak.image,
            });
          }
        }
      }
    }

    // Add items from meals for each day
    for (const day of Object.keys(weeklyPlanValues)) {
      if (day.includes("Meals")) {
        const meals = weeklyPlanValues[day];
        for (const mealName of meals) {
          const meal =
            weeklyPlanProps.response.payload.weeklyPlanData.availableMeals.find(
              (m) => m.name === mealName.name
            );
          if (meal) {
            for (const foodItem of meal.foodItems) {
              const existingItem = shoppingList.find(
                (item) => item.foodItem === foodItem.foodId.name
              );
              if (existingItem) {
                existingItem.qty += foodItem.qty;
              } else {
                shoppingList.push({
                  foodItem: foodItem.foodId.name,
                  qty: foodItem.qty,
                  qtyOption: foodItem.foodId.foodMeasureUnit,
                  isPurchased: false,
                  image: foodItem.foodId.image,
                });
              }
            }
          }
        }
      }
    }

    // Define the old and new shopping lists
    let oldShoppingList = weeklyPlanValues.shoppingList;
    let newShoppingList = shoppingList;

    newShoppingList.forEach((newItem) => {
      let foundItem = oldShoppingList.find(
        (oldItem) => oldItem.foodItem === newItem.foodItem
      );
      if (foundItem) {
        if (foundItem.qty === newItem.qty) {
          newItem.isPurchased = foundItem.isPurchased;
        }
      }
    });

    setFieldValue(`shoppingList`, newShoppingList);
    setFieldValue(`shoppingListIsUpdated`, true);

    return newShoppingList;
  }

  const customStylesWkPlan = {
    control: (provided) => ({
      ...provided,
      borderRadius: "0.375rem",
      "@media (max-width: 767px)": {
        height: "30px",
      },
      "@media (min-width: 768px)": {
        height: "40px",
      },
    }),
  };

  return (
    <Layout>
      <Head>
        <title>Weekly Plan</title>
      </Head>

      <section className="w-[320px] md:w-[750px] mx-auto  items-center gap-3 mt-4 md:mt-8">
        <div className="flex justify-center">
          <h1 className="font-bold md:text-xl">Weekly Plan</h1>
        </div>

        {weeklyPlans.status === "loading" && <div>Loading...</div>}
        {weeklyPlans.status === "loaded" && (
          <Formik
            innerRef={formikRef}
            initialValues={initialValues}
            onSubmit={onSubmit}
            validationSchema={validationSchema}
          >
            {({
              values,
              handleSubmit,
              handleChange,
              errors,
              touched,
              resetForm,
              setFieldValue,
              isSubmitting,
            }) => (
              <Form
                className="w-[320px] md:w-[750px] grid grid-rows-10 mx-auto justify-items-center gap-3 mt-4 md:mt-8"
                onSubmit={handleSubmit}
              >
                <div className="w-[320px] md:w-[750px] mb-2 grid grid-cols-1 md:grid-cols-2 md:grid-rows-1 md:gap-x-10 gap-5 justify-around">
                  <div className="flex flex-col gap-2 md:col-start-1 md:row-start-1">
                    <p
                      className={`text-left ml-1 mt-1 text-sm md:text-base mb-1 font-medium`}
                    >
                      Week number:
                    </p>
                    <Field name={`weekNr`}>
                      {({ field, form }) => (
                        <Select
                          className="select-wrap w-70 mb-0.5 md:mb-0 items-center md:w-85 text-sm md:text-base"
                          menuPlacement="bottom"
                          styles={customStylesWkPlan}
                          classNamePrefix="select-box"
                          instanceId={instanceId}
                          isSearchable={true}
                          value={{
                            value: values.weekNr,
                            label: getWeekNrOptionLabel(values.weekNr),
                          }}
                          options={
                            weekNrOptions
                          }
                          onChange={(selectedOption) => {
                            form.setFieldValue(`weekNr`, selectedOption.value);
                          }}
                        />
                      )}
                    </Field>
                  </div>

                  <div
                    className={`${styles.input_group} flex-col md:col-start-2 md:row-start-1 bg-green-100`}
                  >
                    <div
                      className={`text-left ml-3 mt-1 text-sm md:text-base mb-1 font-medium`}
                    >{` 
                      ${
                        values.privateAll
                          ? "All private food items and meals"
                          : "Private food items and miels based on diet"
                      }`}</div>
                    <label
                      className={`mr-3 ml-3 mt-1 text-sm md:text-base 
                        ${
                          privateAll == true &&
                          values.privateAll != privateAll
                            ? "text-rose-500"
                            : ""
                        }`}
                    >
                      <input
                        type="radio"
                        name="privateBool"
                        className="mr-1"
                        checked={privateAll === true}
                        onChange={() => setPrivateAll(true)} //onChange={() => setFieldValue("privateBool", true)}
                      />
                      All private food items and meals
                    </label>
                    <label
                      className={`mr-3 ml-3 mt-1 mb-1 text-sm md:text-base
                        ${
                          privateAll == false &&
                          values.privateAll != privateAll
                            ? "text-rose-500"
                            : ""
                        }`}
                    >
                      <input
                        type="radio"
                        name="privateBool"
                        className="mr-1"
                        checked={privateAll === false}
                        onChange={() => setPrivateAll(false)}
                      />
                      Only food items and meals based on diet
                    </label>
                    <div className=" mt-1 min-w-[120px] max-w-[250px] mx-auto mb-1">
                      <button
                        disabled={privateAll == values.privateAll}
                        className={`${styles.button_no_bg} py-1 bg-gradient-to-r
                          ${
                            privateAll == values.privateAll
                              ? "from-green-400 to-green-500"
                              : " from-red-500 to-red-600"
                          }`}
                        onClick={() => resetPrivateAll(setFieldValue)}
                      >
                        <span className="px-1 md:px-2">
                          {privateAll == values.privateAll
                            ? "Snacks/Meals Updated"
                            : "Reset Snacks/Meals"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                <div
                  className={`w-[320px] md:w-[750px] h-auto flex flex-row justify-between gap-1 md:gap-2 overflow-x-scroll md:overflow-hidden`}
                >
                  <div className="mb-1 ">
                    <button
                      type="button"
                      onClick={() => setDaySelect("monday")}
                      className={`${
                        styles.button_no_border
                      } bg-gradient-to-r from-teal-400 to-teal-400 py-1 px-1 md:px-2
                        ${
                          (errors.mondayMealsBreakfast &&
                            touched.mondayMealsBreakfast) ||
                          (errors.mondaySnaks &&
                            touched.mondaySnaks)
                            ? "border-rose-600"
                            : "border-transparent"
                        }`}
                    >
                      Monday
                    </button>
                  </div>

                  <div className="mb-1 ">
                    <button
                      type="button"
                      onClick={() => setDaySelect("tuesday")}
                      className={`${
                        styles.button_no_border
                      } bg-gradient-to-r from-teal-400 to-teal-400 py-1 px-1 md:px-2
                        ${
                          (errors.tuesdayMealsBreakfast &&
                            touched.tuesdayMealsBreakfast) ||
                          (errors.tuesdaySnaks &&
                            touched.tuesdaySnaks)
                            ? "border border-rose-600"
                            : "border-transparent"
                        }`}
                    >
                      Tuesday
                    </button>
                  </div>

                  <div className="mb-1 ">
                    <button
                      type="button"
                      onClick={() => setDaySelect("wednesday")}
                      className={`${
                        styles.button_no_border
                      } bg-gradient-to-r from-teal-400 to-teal-400 py-1 px-1 md:px-2
                        ${
                          (errors.wednesdayMealsBreakfast &&
                            touched.wednesdayMealsBreakfast) ||
                          (errors.wednesdaySnaks &&
                            touched.wednesdaySnaks)
                            ? "border border-rose-600"
                            : "border-transparent"
                        }`}
                    >
                      Wednesday
                    </button>
                  </div>

                  <div className="mb-1 ">
                    <button
                      type="button"
                      onClick={() => setDaySelect("thursday")}
                      className={`${
                        styles.button_no_border
                      } bg-gradient-to-r from-teal-400 to-teal-400 py-1 px-1 md:px-2
                        ${
                          (errors.thursdayMealsBreakfast &&
                            touched.thursdayMealsBreakfast) ||
                          (errors.thursdaySnaks &&
                            touched.thursdaySnaks)
                            ? "border border-rose-600"
                            : "border-transparent"
                        }`}
                    >
                      Thursday
                    </button>
                  </div>

                  <div className="mb-1 ">
                    <button
                      type="button"
                      onClick={() => setDaySelect("friday")}
                      className={`${
                        styles.button_no_border
                      } bg-gradient-to-r from-teal-400 to-teal-400 py-1 px-1 md:px-2
                        ${
                          (errors.fridayMealsBreakfast &&
                            touched.fridayMealsBreakfast) ||
                          (errors.fridaySnaks &&
                            touched.fridaySnaks)
                            ? "border border-rose-600"
                            : "border-transparent"
                        }`}
                    >
                      Friday
                    </button>
                  </div>

                  <div className="mb-1 ">
                    <button
                      type="button"
                      onClick={() => setDaySelect("saturday")}
                      className={`${
                        styles.button_no_border
                      } bg-gradient-to-r from-teal-400 to-teal-400 py-1 px-1 md:px-2
                        ${
                          (errors.saturdayMealsBreakfast &&
                            touched.saturdayMealsBreakfast) ||
                          (errors.saturdaySnaks &&
                            touched.saturdaySnaks)
                            ? "border border-rose-600"
                            : "border-transparent"
                        }`}
                    >
                      Saturday
                    </button>
                  </div>

                  <div className="mb-1 ">
                    <button
                      type="button"
                      onClick={() => setDaySelect("sunday")}
                      className={`${
                        styles.button_no_border
                      } bg-gradient-to-r from-teal-400 to-teal-400 py-1 px-1 md:px-2
                        ${
                          (errors.sundayMealsBreakfast &&
                            touched.sundayMealsBreakfast) ||
                          (errors.sundaySnaks &&
                            touched.sundaySnaks)
                            ? "border border-rose-600"
                            : "border-transparent"
                        }`}
                    >
                      Sunday
                    </button>
                  </div>
                </div>

                <div
                  className={`w-[320px] md:w-[750px] ${
                    daySelect == "monday" ? "block" : "hidden"
                  }`}
                >
                  <DailyInputFieldArray
                    values={values}
                    weeklyPlanProps={weeklyPlanProps}
                    setFieldValue={setFieldValue}
                    fieldName="monday"
                    errors={errors}
                    touched={touched}
                  />
                </div>

                <div
                  className={`w-[320px] md:w-[750px] ${
                    daySelect == "tuesday" ? "block" : "hidden"
                  }`}
                >
                  <DailyInputFieldArray
                    values={values}
                    weeklyPlanProps={weeklyPlanProps}
                    setFieldValue={setFieldValue}
                    fieldName="tuesday"
                    errors={errors}
                    touched={touched}
                  />
                </div>

                <div
                  className={`w-[320px] md:w-[750px] ${
                    daySelect == "wednesday" ? "block" : "hidden"
                  }`}
                >
                  <DailyInputFieldArray
                    values={values}
                    weeklyPlanProps={weeklyPlanProps}
                    setFieldValue={setFieldValue}
                    fieldName="wednesday"
                    errors={errors}
                    touched={touched}
                  />
                </div>

                <div
                  className={`w-[320px] md:w-[750px] ${
                    daySelect == "thursday" ? "block" : "hidden"
                  }`}
                >
                  <DailyInputFieldArray
                    values={values}
                    weeklyPlanProps={weeklyPlanProps}
                    setFieldValue={setFieldValue}
                    fieldName="thursday"
                    errors={errors}
                    touched={touched}
                  />
                </div>

                <div
                  className={`w-[320px] md:w-[750px] ${
                    daySelect == "friday" ? "block" : "hidden"
                  }`}
                >
                  <DailyInputFieldArray
                    values={values}
                    weeklyPlanProps={weeklyPlanProps}
                    setFieldValue={setFieldValue}
                    fieldName="friday"
                    errors={errors}
                    touched={touched}
                  />
                </div>

                <div
                  className={`w-[320px] md:w-[750px] ${
                    daySelect == "saturday" ? "block" : "hidden"
                  }`}
                >
                  <DailyInputFieldArray
                    values={values}
                    weeklyPlanProps={weeklyPlanProps}
                    setFieldValue={setFieldValue}
                    fieldName="saturday"
                    errors={errors}
                    touched={touched}
                  />
                </div>

                <div
                  className={`w-[320px] md:w-[750px] ${
                    daySelect == "sunday" ? "block" : "hidden"
                  }`}
                >
                  <DailyInputFieldArray
                    values={values}
                    weeklyPlanProps={weeklyPlanProps}
                    setFieldValue={setFieldValue}
                    fieldName="sunday"
                    errors={errors}
                    touched={touched}
                  />
                </div>

                <div className="in-w-[10px] mt-3 flex justify-center">
                  <button
                    type="button"
                    className={`${styles.button} px-1 md:px-3`}
                    onClick={() => generateShoppingList(values, setFieldValue)}
                  >
                    Update Shopping List
                  </button>
                </div>

                <p className="mb-1 md:text-lg font-bold text-left">{`Shopping List`}</p>
                {values.shoppingList.map((name, index) => (
                  <div
                    key={index}
                    className={`flex flex-col  w-full ${
                      index < values.shoppingList.length - 1 ? "mb-4" : ""
                    }`}
                  >

                    <div className={`flex flex-row items-center `}>
                      <div className="w-16 h-16 ml-1 md:ml-2 flex items-center justify-center">
                        {values.shoppingList[index].image ? (
                          <Image
                            className={`${styles.avatar_medium} border-2 flex justify-start`}
                            cloudName={
                              process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
                            }
                            publicId={values.shoppingList[index].image}
                            alt={
                              values.shoppingList[index].image
                                ? (values.shoppingList[index].image as string)
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
                            {values.shoppingList[index].foodItem}
                          </p>
                        </div>

                        <div className="flex items-center justify-between w-[159px] md:w-48 border rounded-lg h-8 md:h-10 bg-white text-sm md:text-base">
                          <div className="flex items-center overflow-hidden pl-2 w-20 md:w-24 mb-0.5 md:mb-0 text-sm md:text-base bg-white">
                            <p className="text-center whitespace-nowrap truncate">
                              {values.shoppingList[index].qty}
                            </p>
                          </div>
                          <div className="ml-2 mr-2 flex items-center justify-center h-full">
                            {"["}
                            {values.shoppingList[index].qtyOption}
                            {"]"}
                          </div>
                        </div>

                        <div className="flex items-center justify-between border rounded-lg h-8 md:h-10 bg-white text-sm md:text-base">
                          <div className="flex items-center overflow-hidden pl-1 text-sm md:text-base bg-white">
                            Bought
                          </div>
                          <Field
                            type="checkbox"
                            name={`shoppingList.${index}.isPurchased`}
                            className="w-4 h-4 md:w-5 md:h-5 ml-1 md:ml-2 mr-1 md:mr-2"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="min-w-[10px] mt-3 flex justify-center">
                  <button
                    type="submit"
                    className={`${styles.button} px-1 md:px-3`}
                  >
                    Submit
                  </button>
                </div>
              </Form>
            )}
          </Formik>
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
  const weeklyPlanId = context.params?.weeklyPlanIdNewFrom as string;
  let responseLoaded: ServiceLoaded<IWeklyPlan> = {
    status: "loaded",
    payload: {
      weeklyPlanData: {
        currentWeeklyPlan: undefined,
        availableFoodItems: [],
        availableFoodItemsAllPrivate: [],
        availableMeals: [],
        availableMealsAllPrivate: [],
        diet: [],
        availableWeekNumbers: [],
        foodItemsSelectOptions: [],
        foodItemsSelectOptionsAllPrivate: [],
        mealsSelectOptions: [],
        mealsSelectOptionsAllPrivate: [],
        userId: "",
        year: 0,
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

  async function getFoodItems(
    querryData: string[],
    privateAll: boolean,
    username: string
  ) {
    const options = {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    };
    const encodedDiets = encodeURIComponent(querryData.join(",")); // encodeURIComponent(querryData.join(','))
    const url = `${absoluteUrl}/api/meal/getFoodItemsByDiet?diets=${encodedDiets}&isPrivate=${true}&privateAll=${privateAll}&username=${username}`;

    await fetch(url, options)
      .then(async (response) => {
        if (!response.ok) {
          const error = await response.json();
          console.log(error);
          throw new Error(error);
        } else {
          return await response.json();
        }
      })
      .then((data) => {
        responseLoaded.status = "loaded";
        if (privateAll) {
          responseLoaded.payload.weeklyPlanData.availableFoodItemsAllPrivate =
            data;
        } else {
          responseLoaded.payload.weeklyPlanData.availableFoodItems = data;
        }
      })
      .catch(
        (err) =>
          (responseError = {
            status: "error",
            error: "Error getting the food Items!",
          })
      );
  }

  async function getMeals(
    querryData: string[],
    privateAll: boolean,
    username: string
  ) {
    const options = {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    };
    const encodedMeals = encodeURIComponent(querryData.join(",")); 
    const url = `${absoluteUrl}/api/meal/getMeals?diets=${encodedMeals}&privateAll=${privateAll}&username=${username}`;

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
        responseLoaded.status = "loaded";
        if (privateAll) {
          responseLoaded.payload.weeklyPlanData.availableMealsAllPrivate =
            data.results;
        } else {
          responseLoaded.payload.weeklyPlanData.availableMeals = data.results;
        }
      })
      .catch(
        (err) =>
          (responseError = {
            status: "error",
            error: `Error getting the Meals! ${err}`,
          })
      );
  }

  function getWeekNr(): number {
    const now: Date = new Date();
    const weekNumber: number = getISOWeek(now);

    return weekNumber;
  }

  const currentWeekNr = getWeekNr();
  const weeksToCheck = [
    currentWeekNr,
    currentWeekNr + 1,
    currentWeekNr + 2,
    currentWeekNr + 3,
  ];

  const sessionObj: Session | null = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  );
  const userDietPreference: string[] = sessionObj?.user.dietPreference;
  const currentYear = new Date().getFullYear();
  connectMongo();
  const existingWeeks = await WeeklyPlan.distinct("weekNr", {
    owner: String(sessionObj.user._id),
    year: currentYear,
    weekNr: { $in: weeksToCheck },
  });
  const nonExistingWeeks = weeksToCheck.filter(
    (weekNr) => !existingWeeks.includes(weekNr)
  );

  if (!userDietPreference) {
    responseError = {
      status: "error",
      error: "Error getting the user's diet preferences!",
    };
  } else if (nonExistingWeeks.length == 0) {
    responseError = {
      status: "error",
      error: "Week plan created for all available weeks!",
    };
  } else {
    responseLoaded.status = "loaded";
    responseLoaded.payload.weeklyPlanData.availableWeekNumbers = nonExistingWeeks;
    responseLoaded.payload.weeklyPlanData.diet = userDietPreference;
    responseLoaded.payload.weeklyPlanData.userId = sessionObj.user._id;
    responseLoaded.payload.weeklyPlanData.year = new Date().getFullYear();

    await getFoodItems(userDietPreference, true, sessionObj.user.username);
    await getFoodItems(userDietPreference, false, sessionObj.user.username);
    await getMeals(userDietPreference, true, sessionObj.user.username);
    await getMeals(userDietPreference, false, sessionObj.user.username);
    await getWeeklyPlan(weeklyPlanId);

    const foodNames =
      responseLoaded.payload.weeklyPlanData.availableFoodItems != undefined
        ? responseLoaded.payload.weeklyPlanData.availableFoodItems.map(
            (item) => item.name
          )
        : [""];
    responseLoaded.payload.weeklyPlanData.foodItemsSelectOptions =
      foodNames.map((food) => ({ value: food, label: food }));

    const foodNamesAllPrivate =
      responseLoaded.payload.weeklyPlanData.availableFoodItemsAllPrivate !=
      undefined
        ? responseLoaded.payload.weeklyPlanData.availableFoodItemsAllPrivate.map(
            (item) => item.name
          )
        : [""];
    responseLoaded.payload.weeklyPlanData.foodItemsSelectOptionsAllPrivate =
      foodNamesAllPrivate.map((food) => ({ value: food, label: food }));

    const mealNames =
      responseLoaded.payload.weeklyPlanData.availableMeals != undefined
        ? responseLoaded.payload.weeklyPlanData.availableMeals.map(
            (item) => item.name
          )
        : [""];
    responseLoaded.payload.weeklyPlanData.mealsSelectOptions = mealNames.map(
      (meal) => ({ value: meal, label: meal })
    );

    const mealNamesAllPrivate =
      responseLoaded.payload.weeklyPlanData.availableMealsAllPrivate !=
      undefined
        ? responseLoaded.payload.weeklyPlanData.availableMealsAllPrivate.map(
            (item) => item.name
          )
        : [""];
    responseLoaded.payload.weeklyPlanData.mealsSelectOptionsAllPrivate =
      mealNamesAllPrivate.map((meal) => ({ value: meal, label: meal }));
  }

  if (responseError) {
    return {
      props: { response: responseError },
    };
  }

  return {
    props: { response: responseLoaded },
  };
};
