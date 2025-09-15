// app/about/page.tsx or pages/about.tsx
import React from "react";

const teamMembers = [
 
  {
    name: "Upasana Gaur",
    
    
    image: "https://via.placeholder.com/150",
  },
 
];

export default function About() {
  return (
    <div className="min-h-screen px-6 py-12 bg-gray-50 text-gray-800">
      <div className="max-w-5xl mx-auto space-y-16">
        {/* ✅ Intro Section */}
        <section>
          <h1 className="text-4xl font-bold text-blue-700 mb-4">About Us</h1>
          <p className="text-lg">
            Welcome to <strong>Health & Fitness Tracker</strong> — your
            personal wellness companion. Our platform helps you monitor
            workouts, track progress, and receive personalized AI-driven health
            insights.
          </p>
        </section>

        {/* 🎯 Mission Section */}
        <section>
          <h2 className="text-3xl font-semibold text-blue-600 mb-2">Our Mission</h2>
          <p className="text-lg">
            We aim to make fitness smarter and more accessible. Our goal is to
            empower people with intelligent tools to build healthy, active, and
            sustainable lifestyles.
          </p>
        </section>

        {/* 👨‍👩‍👧‍👦 Team Section */}
        <section>
          <h2 className="text-3xl font-semibold text-blue-600 mb-8">Meet the Team</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {teamMembers.map((member, idx) => (
              <div
                key={idx}
                className="bg-white p-4 rounded-2xl shadow-md text-center"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-24 h-24 mx-auto rounded-full mb-4"
                />
                <h3 className="text-xl font-bold">{member.name}</h3>
                <p className="text-gray-500">{member.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 💬 Testimonials (optional) */}
        <section>
          <h2 className="text-3xl font-semibold text-blue-600 mb-4">What People Are Saying</h2>
          <p className="italic text-gray-600">"Coming soon..."</p>
        </section>
      </div>
    </div>
  );
}
