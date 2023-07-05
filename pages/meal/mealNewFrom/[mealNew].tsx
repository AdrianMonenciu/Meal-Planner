import Head from "next/head";
import styles from "../../../styles/Form.module.css";
import { Image } from "cloudinary-react";
import { useEffect, useState, useRef, useId } from "react";
import {
  ErrorMessage,
  Field,
  FieldArray,
  Form,
  Formik,
  useFormik,
} from "formik";
import Layout from "../../../components/layout";
import { dietPreferencesFood } from "../../../lib/dietPreference";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { GetServerSideProps } from "next";
import { IMeal } from "../../../models/Meal";
import { IFood } from "../../../models/FoodItem";
import Select from "react-select";
import { Session, unstable_getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]";
import { useSession } from "next-auth/react";

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

interface IMeals {
  results: IMeal;
}

export default function UpdateFood(mealItemProps) {
  const instanceId = useId();

  const [mealItems, setMealItems] = useState<Service<IMeals>>({
    status: "loading",
  });

  const formik2Ref = useRef<any>();

  const mealOptions = [{ value: "", label: "" }];

  const { data: session, status } = useSession();

  const [availableFoodItems, setavailableFoodItems] = useState(mealOptions);
  const [currentDietPlan, setCurrentDietPlan] = useState([""]);
  const [currentFoodItemsData, setCurrentFoodItemsData] = useState<IFood[]>(); //<IFood[]>
  const [dietPlanUpdated, setdietPlanUpdated] = useState<boolean>(true);
  const [previewImage, setPreviewImage] = useState<string>();

  useEffect(() => {
    if (mealItemProps.response.status == "error") {
      setMealItems({ status: "error", error: mealItemProps.response.error });
    } else {
      setMealItems({
        status: "loaded",
        payload: mealItemProps.response.payload,
      });
    }
    setCurrentDietPlan(mealItemProps.response.payload.results[0].diet);
    getFoodItems(mealItemProps.response.payload.results[0].diet);
  }, []);

  async function uploadImage(image: File | string) {
    var mealImage = mealItemProps.response.payload.results[0].image;
    if (image) {
      const url =
        "https://api.cloudinary.com/v1_1/" +
        process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME +
        "/image/upload";

      const formData = new FormData();
      formData.append("file", image);
      formData.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_PRESET
      );

      const response = await fetch(url, {
        method: "post",
        body: formData,
        mode: "cors",
      }).then((r) => r.json());
      mealImage = response.public_id as string;
    }

    return mealImage;
  }

  interface FormValues {
    name: string;
    diet: string[];
    privateBool: boolean;
    allPrivateFoodItems: boolean;
    image?: File | string;
  }

  interface IfoodItems {
    qty: number;
    name: string;
    qtyOption: string;
    id: string;
    image?: File | string;
  }

  interface FormValues2 {
    foodItems: IfoodItems[];
  }

  const initialValues: FormValues = {
    name:
      mealItemProps.response.status == "loaded"
        ? mealItemProps.response.payload.results[0].name
        : "",
    diet:
      mealItemProps.response.status == "loaded"
        ? mealItemProps.response.payload.results[0].diet
        : [],
    privateBool:
      mealItemProps.response.status == "loaded"
        ? mealItemProps.response.payload.results[0].privateBool
        : [],
    allPrivateFoodItems:
      mealItemProps.response.status == "loaded"
        ? mealItemProps.response.payload.results[0].privateAllFoods
        : false,
    image: null,
  };

  const initialValues2: FormValues2 = {
    foodItems:
      mealItemProps.response.status == "loaded"
        ? mealItemProps.response.payload.results[0].foodItems.map(
            (foodItem) => ({
              name: foodItem.foodId.name,
              qty: foodItem.qty,
              qtyOption: foodItem.foodId.foodMeasureUnit,
              id: foodItem.foodId._id,
              image: foodItem.foodId.image,
            })
          )
        : [{ name: "", qty: 0, qtyOption: "Quantity", id: "", image: null }],
  };

  const [privateMeal, setPrivateMeal] = useState<boolean>(
    initialValues.privateBool
  );
  const [allPrivateFoodItems, setAllPrivateFoodItems] = useState<boolean>(
    initialValues.allPrivateFoodItems
  );

  const SUPPORTED_FORMATS: string[] = [
    "image/jpg",
    "image/png",
    "image/jpeg",
    "image/gif",
  ];

  const validationSchemaYup: Yup.SchemaOf<FormValues> = Yup.object().shape({
    name: Yup.string()
      .required("Item name required")
      .min(2, "The name must have at least 2 characters!")
      .max(20, "The name must have maximum 20 characters!")
      .test("Empty space", "Name can not start with SPACE!", function (value) {
        if (value) return !(value.charAt(0) === " ");
        else return true;
      }),
    diet: Yup.array(Yup.string()).min(1, "Select at least 1 diet oprion!"),
    privateBool: Yup.bool().required(),
    allPrivateFoodItems: Yup.bool().required(),
    image: Yup.mixed()
      .nullable()
      .required("Image is required!")
      .test(
        "size",
        "File size is too big",
        (value) => value && value.size <= 1024 * 1024 // 5MB
      )
      .test(
        "type",
        "Invalid file format selection",
        (value) => !value || (value && SUPPORTED_FORMATS.includes(value?.type))
      ),
  });

  const validationSchema2 = Yup.object().shape({
    foodItems: Yup.array()
      .required()
      .min(2, "Min 2 food items required!")
      .max(10, "Maximum 10 food items are allowed!")
      .of(
        Yup.object().shape({
          name: Yup.string().required(),
          qty: Yup.number().required().min(0.1, "Min qty is 0.1"),
        })
      ),
  });

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: validationSchemaYup,
    onSubmit: onSubmit1,
  });

  const FoodSelect = ({ arrayHelpers, parentValues }) => {
    const [name, setName] = useState("Please select a food item!");
    const [qty, setQty] = useState<any>(0);
    const [qtyOption, setQtyOption] = useState("");
    const [id, setId] = useState("");
    const [image, setImage] = useState(null);
    const [error, setError] = useState({ name: "", qty: "" });
    const [touched, setTouched] = useState({ name: false, qty: false });

    function updateQtyOptionAndIdSelect(selectedOption) {
      const currentFoodItem = currentFoodItemsData.find(
        (food) => food.name === selectedOption
      );

      setQtyOption(currentFoodItem.foodMeasureUnit);
      setId(currentFoodItem._id as unknown as string);
      setImage(currentFoodItem.image);
    }

    const checkError = (updatedName, updatedQty, touchedName, touchedQty) => {
      var nameError, qtyError: string;
      if (updatedName == "Please select a food item!" && touchedName) {
        nameError = "Please select a food item!";
      } else {
        nameError = "";
      }

      if (updatedQty <= 0 && touchedQty) {
        qtyError = "Quantity needs to be bigger than 0!";
      } else {
        qtyError = "";
      }
      setError({ name: nameError, qty: qtyError });
    };

    const addNewField = () => {
      arrayHelpers.push({
        name: name,
        qty: qty,
        qtyOption: qtyOption,
        id: id,
        image: image,
      });
    };

    const customStyles = {
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
      <div
        className={`flex flex-col w-full min-h-[72px] bg-green-100 border rounded-xl`}
      >
        <div className="flex flex-row justify-between w-full mt-2 mb-2 items-center ">
          <div className="w-16 h-16 ml-1 md:ml-2 flex items-center justify-center">
            {image ? (
              <Image
                className={`${styles.avatar_medium} border-2 flex justify-start`}
                cloudName={process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}
                publicId={image}
                alt={image ? (image as string) : ""}
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

          <div className="flex flex-wrap max-w-[245px] md:max-w-none  gap-2 md:flex-row md:gap-4">
            <Select
              className="w-60 mb-0.5 md:mb-0 items-center md:w-80 text-sm md:text-base"
              styles={customStyles}
              instanceId={instanceId}
              isSearchable={true}
              isDisabled={availableFoodItems[0].label == ""}
              value={{ value: name, label: name }}
              options={
                availableFoodItems.filter((item) => {
                  for (let i = 0; i < parentValues.foodItems.length; i++) {
                    if (item.value == parentValues.foodItems[i].name) {
                      return false;
                    }
                  }
                  return true;
                })
              }
              onChange={(selectedOption) => {
                setName(selectedOption.value);
                updateQtyOptionAndIdSelect(selectedOption.value);
                checkError(selectedOption.value, qty, true, touched.qty);
                setTouched({ name: true, qty: touched.qty });
              }}
            />

            <div className="flex items-center justify-between w-[159px] md:w-48 border rounded-lg h-8 md:h-10 bg-white text-sm md:text-base">
              <input
                type="number"
                name="qty"
                className="w-20 md:w-24 rounded-lg h-full pl-2"
                disabled={availableFoodItems[0].label === ""}
                value={qty}
                onChange={(e) => {
                  setQty(Number(e.target.value));
                  checkError(name, Number(e.target.value), touched.name, true);
                  setTouched({ name: touched.name, qty: true });
                }}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && qty >= -9 && qty <= 9) {
                    setQty("");
                  }
                }}
              />
              <div className="ml-2 mr-2 flex items-center justify-center h-full">
                {"["}
                {qtyOption}
                {"]"}
              </div>
            </div>

            <div className="min-w-[10px] mr-1 md:mr-2">
              <button
                type="button"
                className={`${styles.button} whitespace-nowrap`}
                onClick={() => {
                  if (name != "Please select a food item!" && qty > 0) {
                    addNewField();
                    setName("Please select a food item!");
                    setImage("");
                    setQty(0);
                    setQtyOption("");
                    setError({ name: "", qty: "" });
                    setTouched({ name: false, qty: false });
                    checkError(name, qty, false, false);
                  } else {
                    setTouched({ name: true, qty: true });
                    checkError(name, qty, true, true);
                    console.log(`name:${name} and qty: ${qty}`);
                  }
                }}
              >
                <span className=" ml-1 mr-1 md:ml-4 md:mr-4">Add Food</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex ml-4">
          <span
            className={`text-rose-500 mr-5 text-sm md:text-base ${
              error.name || error.qty ? "mb-1" : ""
            }`}
          >
            {`${error.name} ${error.name != "" ? " " : ""} ${error.qty}`}
          </span>
        </div>
      </div>
    );
  };

  useEffect(() => {
    const idietArraysEqual =
      JSON.stringify(formik.values.diet) === JSON.stringify(currentDietPlan);
    setdietPlanUpdated(idietArraysEqual);
  }, [formik.values.diet, currentDietPlan]);

  useEffect(() => {
     if (
      formik.values.privateBool != privateMeal ||
      formik.values.allPrivateFoodItems != allPrivateFoodItems
    ) {
      setdietPlanUpdated(false);
    } else {
      setdietPlanUpdated(true);
    }
  }, [
    formik.values.privateBool,
    privateMeal,
    formik.values.allPrivateFoodItems,
    allPrivateFoodItems,
  ]);

  async function onSubmit1(values: FormValues) {
    await getFoodItems(values.diet);

    setCurrentDietPlan(values.diet.map((food) => food));
    setPrivateMeal(values.privateBool);
    setAllPrivateFoodItems(values.allPrivateFoodItems);
    formik2Ref.current.setValues({ foodItems: [] });
  }

  async function onSubmit2(values: FormValues2) {
    console.log(values);
    console.log(formik.values);

    interface IMeal_api_body {
      name: string;
      diet: string[];
      privateBool: boolean;
      privateAllFoods: boolean;
      image?: File | string;
      foodItems: {
        foodId: string;
        qty: number;
      }[];
    }

    const response = await uploadImage(formik.values.image);

    if (response) {
      const meal_api_body: IMeal_api_body = {
        name:
          formik.values.name.charAt(0).toUpperCase() +
          formik.values.name.slice(1).toLowerCase(), 
        diet: currentDietPlan,
        privateBool: privateMeal,
        privateAllFoods: allPrivateFoodItems,
        image: response,
        foodItems: values.foodItems.map(({ id, qty }) => ({
          foodId: id,
          qty: qty,
        })),
      };

      console.log(meal_api_body);

      const options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(meal_api_body),
      };

      await fetch("/api/meal/meal", options)
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          toast(data.message);
        });
    } else {
      toast("Image could not be uploaded.");
    }
  }

  async function getFoodItems(querryData: string[]) {
    const options = {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    };
    const encodedDiets = encodeURIComponent(querryData.join(",")); 
    const url = `/api/meal/getFoodItemsByDiet?diets=${encodedDiets}&isPrivate=${formik.values.privateBool}&privateAll=${formik.values.allPrivateFoodItems}&username=${session.user.username}`;

    await fetch(url, options)
      .then(async (response) => {
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error);
        } else {
          return await response.json();
        }
      })
      .then((data) => {
        setCurrentFoodItemsData(data);
      })
      .catch((err) => toast.error(err));
  }

  useEffect(() => {
    const foodNames =
      currentFoodItemsData != undefined
        ? currentFoodItemsData.map((item) => item.name)
        : [""];
    setavailableFoodItems(
      foodNames.map((food) => ({ value: food, label: food }))
    );
    console.log(currentFoodItemsData);
  }, [currentFoodItemsData]);

  const ErrorDisplay = ({ error }) => {
    if (typeof error === "string") {
      return <div>{error}</div>;
    }

    return null;
  };

  return (
    <Layout>
      <Head>
        <title>Update Food Item</title>
      </Head>

      <section className="min-w-[250px] max-w-[320px] md:max-w-[900px] items-center mx-auto flex flex-col gap-3 mt-4 md:mt-8">
        <div className="flex justify-start">
          <h1 className="font-bold md:text-xl">New Meal Item</h1>
        </div>

        {mealItems.status === "loading" && <div>Loading...</div>}
        {mealItems.status === "loaded" && (
          <>
            <form
              className=" grid grid-cols-1 md:grid-cols-2 md:grid-rows-1 md:gap-x-10 gap-5"
              onSubmit={formik.handleSubmit}
            >
              <div className="flex flex-col gap-5 md:col-start-1 md:row-start-1">
                <div className="flex flex-col">
                  <div
                    className={`${styles.input_group} ${
                      formik.errors.name && formik.touched.name
                        ? "border-rose-600"
                        : ""
                    }`}
                  >
                    <input
                      type="text"
                      name="Name"
                      placeholder="Meal name"
                      className={styles.input_text}
                      {...formik.getFieldProps("name")}
                    />
                  </div>
                  {formik.errors.name && formik.touched.name ? (
                    <span className={`${styles.formikError}`}>
                      {formik.errors.name}
                    </span>
                  ) : (
                    <></>
                  )}
                </div>

                <div
                  className={`${styles.input_group} flex-col bg-green-100 
                            ${
                              formik.errors.diet && formik.touched.diet
                                ? "border-rose-600"
                                : ""
                            }`}
                >
                  <div
                    className={`text-left ml-3 mt-1 font-medium text-sm md:text-base ${
                      currentDietPlan.length == 0 ? "mb-1" : ""
                    } font-bold`}
                  >
                    {" "}
                    Current Diet:{" "}
                  </div>
                  <div className="flex flex-col mb-1">
                    {currentDietPlan.map((diet) => (
                      <span
                        key={diet}
                        className="mr-3 ml-3 text-sm md:text-base"
                      >
                        {" "}
                        {diet}{" "}
                      </span>
                    ))}
                  </div>
                  <div
                    className="text-left ml-3 mt-2 mb-1 font-medium text-sm md:text-base"
                    id="checkbox-group"
                  >
                    Select Dietary suitability:
                  </div>
                  <div
                    className={`flex flex-col mb-1`}
                    role="group"
                    aria-labelledby="checkbox-group"
                  >
                    {dietPreferencesFood.map((diet) => (
                      <label
                        className={`mr-3 ml-3 mt-1 ${
                          !currentDietPlan.includes(diet) &&
                          formik.values.diet.indexOf(diet) > -1
                            ? "text-rose-500"
                            : ""
                        } text-sm md:text-base`}
                        key={diet}
                      >
                        <input
                          className="mr-1"
                          type="checkbox"
                          name="diet"
                          {...formik.getFieldProps("diet")}
                          value={diet}
                          checked={
                            formik.values.diet.indexOf(diet) > -1 ? true : false
                          }
                        />{" "}
                        {diet}{" "}
                      </label>
                    ))}
                  </div>
                  {formik.errors.diet && formik.touched.diet ? (
                    <span className="text-rose-500 mb-1 ml-1 text-sm md:text-base">
                      {formik.errors.diet}
                    </span>
                  ) : (
                    <></>
                  )}

                  <div className=" mt-1 min-w-[120px] max-w-[200px] mx-auto mb-1">
                    <button
                      type="submit"
                      disabled={dietPlanUpdated}
                      className={`${styles.button_no_bg} py-1 bg-gradient-to-r
                        ${
                          dietPlanUpdated
                            ? "from-green-400 to-green-500"
                            : " from-red-500 to-red-600"
                        }`}
                    >
                      <span className="px-1 md:px-2">
                        {dietPlanUpdated
                          ? "Food items Updated"
                          : "Reset Food Items"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-5 md:col-start-2 md:row-start-1">
                <div
                  className={`${styles.input_group} flex-col w-full bg-green-100`}
                >
                  <div
                    className={`text-left ml-3 mt-1 text-sm md:text-base mb-1 font-medium`}
                  >{`${
                    !privateMeal
                      ? "Public Meal"
                      : allPrivateFoodItems
                      ? "Private Meal - Include all private Food Items"
                      : "Private Meal - Include diet match Food Items"
                  }`}</div>
                  <label
                    className={`mr-3 ml-3 mt-1 text-sm md:text-base 
                      ${
                        formik.values.privateBool == true &&
                        formik.values.privateBool != privateMeal
                          ? "text-rose-500"
                          : ""
                      }`}
                  >
                    <input
                      type="radio"
                      name="privateBool"
                      className="mr-1"
                      checked={formik.values.privateBool === true}
                      disabled={
                        session
                          ? session.user.userRole == "admin"
                            ? false
                            : true
                          : true
                      }
                      onChange={() => formik.setFieldValue("privateBool", true)}
                    />
                    Private Meal
                  </label>
                  <label
                    className={`mr-3 ml-3 mt-1 mb-1 text-sm md:text-base
                      ${
                        formik.values.privateBool == false &&
                        formik.values.privateBool != privateMeal
                          ? "text-rose-500"
                          : ""
                      }`}
                  >
                    <input
                      type="radio"
                      name="privateBool"
                      className="mr-1"
                      checked={formik.values.privateBool === false}
                      disabled={
                        session
                          ? session.user.userRole == "admin"
                            ? false
                            : true
                          : true
                      }
                      onChange={() =>
                        formik.setFieldValue("privateBool", false)
                      }
                    />
                    Public Meal
                  </label>
                  <label
                    className={`mr-3 ml-3 mt-3 text-sm md:text-base
                      ${
                        formik.values.privateBool &&
                        formik.values.allPrivateFoodItems == true &&
                        formik.values.allPrivateFoodItems !=
                          allPrivateFoodItems
                          ? "text-rose-500"
                          : ""
                      }`}
                  >
                    <input
                      type="radio"
                      name="allPrivateFoodItems"
                      className="mr-1"
                      checked={
                        formik.values.privateBool
                          ? formik.values.allPrivateFoodItems === true
                          : false
                      }
                      disabled={!formik.values.privateBool}
                      onChange={() =>
                        formik.setFieldValue("allPrivateFoodItems", true)
                      }
                    />
                    Include all private Food Items
                  </label>
                  <label
                    className={`mr-3 ml-3 mt-1 mb-1 text-sm md:text-base
                      ${
                        formik.values.privateBool &&
                        formik.values.allPrivateFoodItems == false &&
                        formik.values.allPrivateFoodItems !=
                          allPrivateFoodItems
                          ? "text-rose-500"
                          : ""
                      }`}
                  >
                    <input
                      type="radio"
                      name="allPrivateFoodItems"
                      className="mr-1"
                      checked={
                        formik.values.privateBool
                          ? formik.values.allPrivateFoodItems === false
                          : false
                      }
                      disabled={!formik.values.privateBool}
                      onChange={() =>
                        formik.setFieldValue("allPrivateFoodItems", false)
                      }
                    />
                    Include private Food Items matching diet
                  </label>
                  <div className=" mt-1 min-w-[120px] max-w-[200px] mx-auto mb-1">
                    <button
                      type="submit"
                      disabled={dietPlanUpdated}
                      className={`${styles.button_no_bg} py-1 bg-gradient-to-r
                        ${
                          dietPlanUpdated
                            ? "from-green-400 to-green-500"
                            : " from-red-500 to-red-600"
                        }`}
                    >
                      <span className="px-1 md:px-2">
                        {dietPlanUpdated
                          ? "Food items Updated"
                          : "Reset Food Items"}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center flex-col gap-5">
                  <div className="flex flex-col">
                    <label
                      htmlFor="image"
                      className={`${styles.button} w-full min-w-[120px] max-w-[200px] text-center`}
                    >
                      <span className={`px-1 md:px-2`}>Choose Image File</span>
                    </label>
                    <input
                      name="image"
                      type="file"
                      id="image"
                      onChange={(event) => {
                        formik.setFieldValue("image", event.target.files[0]);
                        if (event?.target?.files?.[0]) {
                          const file = event.target.files[0];
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setPreviewImage(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className={"hidden"}
                    ></input>
                    {formik.errors.image && formik.touched.image ? (
                      <span className="text-rose-500 mt-1 ml-3 text-sm md:text-base">
                        {formik.errors.image}
                      </span>
                    ) : (
                      <></>
                    )}
                  </div>

                  <div>
                    {formik.values.image ? (
                      <>
                        <img
                          src={previewImage}
                          className={`${styles.avatar} `}
                        />
                      </>
                    ) : (
                      <>
                        <div className="text-center">Existing Image</div>
                        <Image
                          className={`${styles.avatar} `}
                          cloudName={
                            process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
                          }
                          publicId={
                            mealItemProps.response.status == "loaded"
                              ? mealItemProps.response.payload.results[0].image
                              : ""
                          }
                          alt={
                            mealItemProps.response.status == "loaded"
                              ? mealItemProps.response.payload.results[0].image
                              : ""
                          }
                          secure
                          dpr="auto"
                          quality="auto"
                          crop="fill"
                          gravity="auto"
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>
            </form>

            <Formik
              innerRef={formik2Ref}
              initialValues={initialValues2}
              onSubmit={onSubmit2}
              validationSchema={validationSchema2}
            >
              {({
                values,
                handleSubmit,
                handleChange,
                errors,
                touched,
                resetForm,
                setFieldValue,
                setTouched,
              }) => (
                <>
                  <section className="mx-auto w-[320px] md:w-[750px] flex flex-col gap-3 mt-3">
                    <div className="title">
                      <p className="w-3/4 ml-2 font-bold">Meal ingredients:</p>
                    </div>

                    <Form className="flex " onSubmit={handleSubmit}>
                      <FieldArray
                        name="foodItems"
                        render={(arrayHelpers) => (
                          <div className="w-full flex flex-col ">
                            {values.foodItems.map((name, index) => (
                              <div
                                key={index}
                                className={`flex flex-col  w-full ${
                                  index < values.foodItems.length - 1
                                    ? "mb-4"
                                    : ""
                                }`}
                              >

                                <div className={`flex flex-row items-center `}>
                                  <div className="w-16 h-16 ml-1 md:ml-2 flex items-center justify-center">
                                    {values.foodItems[index].image ? (
                                      <Image
                                        className={`${styles.avatar_medium} border-2 flex justify-start`}
                                        cloudName={
                                          process.env
                                            .NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
                                        }
                                        publicId={values.foodItems[index].image}
                                        alt={
                                          values.foodItems[index].image
                                            ? (values.foodItems[index]
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
                                      <div className="text-center">
                                        No Image
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex flex-wrap ml-2 max-w-[245px] md:max-w-none  gap-2 md:flex-row md:gap-4">
                                    <div className="flex items-center overflow-hidden pl-2 w-60 mb-0.5 md:mb-0 md:w-80 text-sm md:text-base border rounded-lg h-8 md:h-10 bg-white">
                                      <p className="text-center whitespace-nowrap truncate">
                                        {values.foodItems[index].name}
                                      </p>
                                    </div>

                                    <div className="flex items-center justify-between w-[159px] md:w-48 border rounded-lg h-8 md:h-10 bg-white text-sm md:text-base">
                                      <Field
                                        type="number"
                                        name={`foodItems.${index}.qty`}
                                        className={`w-20 md:w-24 rounded-lg h-full pl-2`}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          setFieldValue(
                                            `foodItems.${index}.qty`,
                                            value !== "" ? Number(value) : null
                                          );
                                        }}
                                      />
                                      <div className="ml-2 mr-2 flex items-center justify-center h-full">
                                        {"["}
                                        {values.foodItems[index].qtyOption}
                                        {"]"}
                                      </div>
                                    </div>

                                    <div className="min-w-[10px] ml-3 md:ml-0 mr-1 md:mr-2">
                                      <button
                                        type="button"
                                        className={`${styles.button_no_bg} py-1 whitespace-nowrap bg-gradient-to-r from-red-500 to-red-600`}
                                        onClick={() =>
                                          arrayHelpers.remove(index)
                                        }
                                      >
                                        <span className=" ml-1 mr-1 md:ml-4 md:mr-4">
                                          Remove
                                        </span>
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                <div
                                  className={`text-rose-500 mr-5 text-left text-sm md:text-base ml-20 mt-1 md:mt-0 mb-1`}
                                >
                                  <ErrorMessage
                                    name={`foodItems[${index}].qty`}
                                    component="div"
                                  />
                                </div>
                              </div>
                            ))}

                            <div
                              className={`text-rose-500 mr-5 text-sm md:text-base mt-1 md:mt-2 ml-2 mb-1`}
                            >
                              <ErrorMessage name="foodItems">
                                {(error) => <ErrorDisplay error={error} />}
                              </ErrorMessage>
                            </div>

                            <div className="mt-3">
                              <FoodSelect
                                arrayHelpers={arrayHelpers}
                                parentValues={values}
                              />
                            </div>

                            <div className="min-w-[10px] mt-3 flex justify-center">
                              <button
                                type="submit"
                                className={`${styles.button} max-w-[120px] `}
                              >
                                New Meal
                              </button>
                            </div>
                          </div>
                        )}
                      />
                    </Form>
                  </section>
                </>
              )}
            </Formik>
          </>
        )}

        {mealItems.status === "error" && <div>{mealItems.error}</div>}
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
  let url = return_url(context);
  const mealNameQuerry = context.params?.mealNew;
  let responseLoaded, responseError;

  const sessionObj: Session | null = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  );

  const options = {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  };
  await fetch(
    `${url}/api/meal/getMeals?mealName=${mealNameQuerry}&limit=1&username=${sessionObj.user.username}`,
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
    .then((data) => (responseLoaded = { status: "loaded", payload: data }))
    .catch((err) => (responseError = { status: "error", error: err.message }));

  if (responseError) {
    return {
      props: { response: responseError },
    };
  }

  return {
    props: { response: responseLoaded },
  };
};