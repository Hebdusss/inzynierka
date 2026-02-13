

export default async function Home() {

  return (
    <main className="p-10">
        <span className="text-6xl font-bold">Welcome to GymRats</span>
        <div className="mt-10">
          <p className="text-2xl">GymRats is a fitness platform designed for those who want to track and improve their healthy lifestyle.
          Create custom workouts, plan your diets, and combine them into training sets.</p>
        </div>
        <div className="flex mt-20 gap-5">
            <div className="rounded-xl border-2 border-black p-5 w-96">
              <h3>Add your own <br /> workouts and diets</h3>
              <div className="mt-5">
                <span>Create personalized workouts with details like body part, reps, series, weight and calories. Add diets with nutritional information including macros and vitamins.</span>
              </div>
            </div>
            <div className="rounded-xl border-2 border-black p-5 w-96">
              <h3>Create sets <br /> </h3>
              <div className="mt-5">
                <span>Combine your workouts and diets into training sets. Track total calories burned, consumed and workout duration. Share your best sets with the community.</span>
              </div>
            </div>
            <div className="rounded-xl border-2 border-black p-5 w-96">
              <h3>Explore your added<br /> entities </h3>
              <div className="mt-5">
                <span>Browse and manage all your workouts, diets and sets. Search through your collection, delete what you don't need, and explore public sets from other users.</span>
              </div>
            </div>
        </div>
        

    </main>
  )
}
