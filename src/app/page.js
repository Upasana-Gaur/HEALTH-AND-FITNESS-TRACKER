"use client";
import React, { useEffect, useState } from "react";
import {
  addFeedback,
  getFeedbacks,
  deleteFeedback,
  auth,
  db,
} from "../lib/firebase";
import { serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore"; // Changed from firebase/auth
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GoalSelector } from "@/components/GoalSelector";

const HomePage = () => {
  const router = useRouter();
  const [showGoalSelector, setShowGoalSelector] = useState(false);
  const [user, setUser] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState("");
  const [feedbackList, setFeedbackList] = useState([]);
  const [userName, setUserName] = useState("");
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }

      setUser(currentUser);
      setUserName(currentUser.displayName || "User");
      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      
      // Remove the automatic redirect to workout page
      if (userDoc.exists() && userDoc.data().goal) {
        setSelectedGoal(userDoc.data().goal);
      }
      
      setShowGoalSelector(!userDoc.exists() || !userDoc.data().goal);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const fetchFeedbacks = async () => {
    const data = await getFeedbacks();
    setFeedbackList(data);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "feedback") setFeedback(value);
    else if (name === "name") setName(value);
    else if (name === "email") setEmail(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !feedback) {
      setStatus("All fields are required!");
      return;
    }

    setIsSubmitting(true);
    setStatus("");

    const feedbackData = {
      name,
      email,
      feedback,
      timestamp: serverTimestamp(),
    };

    try {
      await addFeedback(feedbackData);
      setStatus("Thank you for your feedback!");
      setFeedback("");
      setName("");
      setEmail("");
      fetchFeedbacks();
    } catch (error) {
      setStatus("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    await deleteFeedback(id);
    fetchFeedbacks();
  };

  const handleGoalSelect = async (goalId) => {
    if (user) {
      try {
        await setDoc(
          doc(db, "users", user.uid),
          {
            goal: goalId,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );

        setSelectedGoal(goalId);
        setShowGoalSelector(false);
        router.push("/workout");
      } catch (error) {
        console.error("Error saving goal:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {showGoalSelector ? (
        <GoalSelector onGoalSelect={handleGoalSelect} />
      ) : (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-5xl">
          {/* Hero Section */}
          <div className="text-center space-y-6 mb-16">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-gray-900">
              Welcome
              {userName && (
                <>
                  ,{" "}
                  <span className="text-blue-600" key={userName}>
                    {userName}
                  </span>
                </>
              )}{" "}
              to Your Health & Fitness Journey
            </h1>
            <div className="space-y-4">
              <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
                This platform is designed to help you take charge of your health
                and wellness. Track your workouts, monitor your calories, keep an
                eye on your progress, and get AI-powered recommendations tailored
                to your goals.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Whether you're aiming to gain strength, lose weight, or simply live
                healthier — we're here to guide you every step of the way.
              </p>

              {/* Add this new Goal Selection section */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <button
                  onClick={() => handleGoalSelect("weight-loss")}
                  className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border-2 border-transparent hover:border-blue-500"
                >
                  <div className="text-4xl mb-3">⬇️</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Weight Loss
                  </h3>
                  <p className="text-sm text-gray-500">
                    Get lean and healthy with personalized nutrition and workout
                    plans
                  </p>
                </button>

                <button
                  onClick={() => handleGoalSelect("weight-gain")}
                  className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border-2 border-transparent hover:border-blue-500"
                >
                  <div className="text-4xl mb-3">⬆️</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Weight Gain
                  </h3>
                  <p className="text-sm text-gray-500">
                    Build muscle and strength with targeted exercise and nutrition
                    guidance
                  </p>
                </button>

                <button
                  onClick={() => handleGoalSelect("maintain")}
                  className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border-2 border-transparent hover:border-blue-500"
                >
                  <div className="text-4xl mb-3">⚖️</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Stay Fit
                  </h3>
                  <p className="text-sm text-gray-500">
                    Maintain your current weight while improving overall fitness
                  </p>
                </button>
              </div>

              {selectedGoal && (
                <div className="mt-8 text-center space-y-4">
                  <h3 className="text-xl font-medium text-gray-900">
                    Ready to start your{" "}
                    {selectedGoal === "weight-loss"
                      ? "weight loss"
                      : selectedGoal === "weight-gain"
                      ? "weight gain"
                      : "fitness"}
                    {" journey?"}
                  </h3>
                  <Link
                    href="/profile"
                    className="inline-flex items-center px-6 py-3 rounded-lg bg-blue-600 text-white text-base font-medium hover:bg-blue-700 transition-colors duration-200"
                  >
                    Update Your Profile
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 ml-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Feedback Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-12">
            <div className="p-6 lg:p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
                We Value Your Feedback
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700 mb-2"
                      htmlFor="name"
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700 mb-2"
                      htmlFor="email"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-2"
                    htmlFor="feedback"
                  >
                    Your Feedback
                  </label>
                  <textarea
                    id="feedback"
                    name="feedback"
                    value={feedback}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    rows="4"
                    required
                  ></textarea>
                </div>

                {status && (
                  <p
                    className={`text-center text-sm ${
                      status.includes("thank")
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {status}
                  </p>
                )}

                <div className="text-center">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      "Submit Feedback"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Feedback List */}
          {feedbackList.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="p-6 lg:p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  Recent Feedbacks
                </h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {feedbackList.map((fb) => (
                    <div
                      key={fb.id}
                      className="p-4 rounded-md bg-gray-50 border border-gray-100"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <p className="font-medium text-gray-900 flex items-center gap-2">
                            {fb.name}
                            <span className="text-gray-500 text-sm">
                              ({fb.email})
                            </span>
                          </p>
                          <p className="text-gray-600">{fb.feedback}</p>
                        </div>
                        <button
                          onClick={() => handleDelete(fb.id)}
                          className="text-gray-400 hover:text-red-600 p-1 rounded transition-colors duration-200"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HomePage;
