import Head from "next/head";
import styles from "../../styles/Form.module.css";
import { HiOutlineUser } from "react-icons/hi";
import { useState } from "react";
import { useFormik } from "formik";
import { useRouter } from "next/router";
import Layout from "../../components/layout";
import * as Yup from "yup";
import { Image } from "cloudinary-react";

async function uploadImage(image: File | string) {
  const url =
    "https://api.cloudinary.com/v1_1/" +
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME +
    "/image/upload";

  const formData = new FormData();
  formData.append("file", image);
  formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_PRESET);

  const response = await fetch(url, {
    method: "post",
    body: formData,
    mode: "cors",
  }).then((r) => r.json());

  return response;
}

export default function Register() {
  interface FormImage {
    name?: string;
    image?: File | string;
  }

  const initialValues: FormImage = {
    name: "",
    image: null,
  };

  const SUPPORTED_FORMATS: string[] = [
    "image/jpg",
    "image/png",
    "image/jpeg",
    "image/gif",
  ];

  const validationSchemaYup: Yup.SchemaOf<FormImage> = Yup.object().shape({
    name: Yup.string().required("Required Field"),
    image: Yup.mixed()
      .nullable()
      .required("Required Field")
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

  const [previewImage, setPreviewImage] = useState<string>();
  const [public_id, setPublic_id] = useState<string>();

  const router = useRouter();

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: validationSchemaYup,
    onSubmit,
  });

  async function onSubmit(values: FormImage) {
    const response = await uploadImage(values.image);

    console.log(response);

    setPublic_id(response.public_id as string);
  }

  return (
    <Layout>
      <Head>
        <title>Image</title>
      </Head>

      <section className="w-3/4 mx-auto flex flex-col gap-10">
        <div className="title">
          <h1 className="text-gray-800 text-4xl font-bold py-4">
            Add recipy / item
          </h1>
          <p className="w-3/4 mx-auto text-gray-400">
            Description text goes here.
          </p>
        </div>

        <form className="flex flex-col gap-5" onSubmit={formik.handleSubmit}>
          <div
            className={`${styles.input_group} ${
              formik.errors.name && formik.touched.name ? "border-rose-600" : ""
            }`}
          >
            <input
              type="text"
              name="name"
              placeholder="name"
              className={styles.input_text}
              {...formik.getFieldProps("name")}
            />
            <span className="icon flex items-center px-4">
              <HiOutlineUser size={25} />
            </span>
          </div>

          {formik.errors.name && formik.touched.name ? (
            <span className="text-rose-500">{formik.errors.name}</span>
          ) : (
            <></>
          )}

          <div className="">
            <input
              name="image"
              type="file"
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
              className={""}
            ></input>
          </div>

          {formik.errors.image ? (
            <span className="text-rose-500">{formik.errors.image}</span>
          ) : (
            <></>
          )}

          <div>
            {formik.values.image ? (
              <img
                src={previewImage}
                className="mt-4 object-cover"
                style={{ width: "440px", height: `${300}px` }}
              />
            ) : (
              "No Image"
            )}
          </div>

          <div className="input-button">
            <button type="submit" className={styles.button}>
              Upload
            </button>
          </div>
        </form>

        <div>
          <span>
            Image uploaded to Coudinary:{" "}
            {public_id ? public_id : "Image not uploaded yet"}
          </span>
          {public_id ? (
            <Image
              className="mt-4"
              cloudName={process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}
              publicId={public_id}
              alt={public_id}
              secure
              dpr="auto"
              quality="auto"
              crop="fill"
              gravity="auto"
            />
          ) : null}
        </div>
      </section>
    </Layout>
  );
}
