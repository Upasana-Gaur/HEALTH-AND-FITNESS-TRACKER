// app/support/page.tsx or pages/support.tsx
import React from "react";

export default function Support() {
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12 text-gray-800">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* 🙋‍♀️ Intro */}
        <section>
          <h1 className="text-4xl font-bold text-blue-700 mb-4">Support</h1>
          <p className="text-lg">
            Need help? We’re here for you. Whether it's technical assistance,
            feedback, or just a quick question, feel free to reach out.
          </p>
        </section>

        {/* 📧 Contact Form or Email */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <p className="mb-4">
            Email us at{" "}
            <a
              href="mailto:support@fittrack.com"
              className="text-blue-600 underline"
            >
              support@fittrack.com
            </a>{" "}
            or use the form below:
          </p>

          <form
            action="https://formspree.io/f/yourFormId" 
            method="POST"
            className="space-y-4"
          >
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              className="w-full p-3 border border-gray-300 rounded-xl"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              className="w-full p-3 border border-gray-300 rounded-xl"
              required
            />
            <textarea
              name="message"
              placeholder="Your Message"
              rows={5}
              className="w-full p-3 border border-gray-300 rounded-xl"
              required
            ></textarea>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition"
            >
              Send Message
            </button>
          </form>
        </section>

        {/* 📚 FAQs */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">
            Frequently Asked Questions
          </h2>
          <ul className="space-y-2">
            <li>
              <strong>Q:</strong> How can I reset my password?
              <br />
              <strong>A:</strong> Go to the login page and click "Forgot
              Password".
            </li>
            <li>
              <strong>Q:</strong> How do I update my profile?
              <br />
              <strong>A:</strong> Visit your profile page and click "Edit Info".
            </li>
          </ul>
        </section>

        {/* 🔗 Helpful Links (Optional) */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Helpful Links</h2>
          <ul className="list-disc list-inside">
            <li>
              <a href="/about" className="text-blue-600 underline">
                About Us
              </a>
            </li>
            <li>
              <a href="/profile" className="text-blue-600 underline">
                Edit Profile
              </a>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
