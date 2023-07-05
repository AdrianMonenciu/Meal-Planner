import Head from "next/head";
import styles from "../../styles/Form.module.css";
import Layout from "../../components/layout";
import { toast } from "react-toastify";

export default function Register() {
  async function handleSchemaUser() {
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ test: "test" }),
    };

    await fetch("/api/examples/updateSchemaUser", options)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        toast(data.message);
      });
  }

  async function handleSchemaFood() {
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ test: "test" }),
    };

    await fetch("/api/examples/updateSchemaFood", options)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        toast(data.message);
      });
  }

  async function handleSchemaMeal() {
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ test: "test" }),
    };

    await fetch("/api/examples/updateSchemaMeal", options)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        toast(data.message);
      });
  }

  return (
    <Layout>
      <Head>
        <title>Register</title>
      </Head>

      <section className="flex flex-col justify-evenly gap-10 m-auto bg-slate-50 rounded-md w-3/5 text-center py-4 px-4">
        <div className="title">
          <h1 className="text-gray-800 text-4xl font-bold py-4">
            Update schemas
          </h1>
        </div>

        <button
          type="submit"
          className={styles.button}
          onClick={handleSchemaUser}
        >
          Update Users Schema
        </button>

        <br></br>

        <button
          type="submit"
          className={styles.button}
          onClick={handleSchemaFood}
        >
          Update Food Schema
        </button>

        <button
          type="submit"
          className={styles.button}
          onClick={handleSchemaMeal}
        >
          Update Meal Schema
        </button>
      </section>
    </Layout>
  );
}