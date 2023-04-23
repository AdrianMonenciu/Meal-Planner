import Layout from "../components/layout"

export default function IndexPage() {
  return (
    <Layout>
      <div className="text-center mt-11 min-w-[300px] max-w-[350px] md:min-w-[350px] md:max-w-[500px] mx-auto">
        <h1 className="font-bold">Meal Planner website</h1>
        <p className="mt-3 mb-1 whitespace-pre-line">
          This is a meal planner webiste. <br></br>
          You can use existing snacks and recipies  or create your own. <br></br>
          The app will create a shopping list based on your weekly meal plan.
        </p>
      </div>
    </Layout>
  )
}
