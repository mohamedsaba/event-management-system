const steps = [
  {
    title: "Browse Events",
    description: "Explore upcoming conferences and meetups."
  },
  {
    title: "Register",
    description: "Reserve your tickets in seconds."
  },
  {
    title: "Attend",
    description: "Show up and enjoy the event."
  }
]

const HowItWorks = () => {
  return (
    <section className="py-20 bg-white">

      <h2 className="text-3xl font-bold text-center mb-12">
        How It Works
      </h2>

      <div className="grid md:grid-cols-3 gap-10 max-w-5xl mx-auto">

        {steps.map((step, index) => (
          <div key={index} className="text-center p-6 shadow rounded-lg">

            <h3 className="text-xl font-semibold mb-3">
              {step.title}
            </h3>

            <p className="text-gray-600">
              {step.description}
            </p>

          </div>
        ))}

      </div>

    </section>
  )
}

export default HowItWorks