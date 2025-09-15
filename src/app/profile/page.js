"use client";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState, useRef } from "react";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Image from 'next/image';
import { FiUser, FiMail, FiEdit2, FiSave, FiCamera } from 'react-icons/fi';
import { FormField } from '@/components/FormField';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [photoURL, setPhotoURL] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({

    // Basic Information
    age: "",
    gender: "",
    dateOfBirth: "",
    height: "",
    weight: "",
    
    // Body Measurements
    waistCircumference: "",
    hipCircumference: "",
    chestCircumference: "",
    bodyFatPercentage: "",
    
    // Health Metrics
    bloodPressure: "",
    restingHeartRate: "",
    bloodType: "",
    
    // Lifestyle
    occupation: "",
    activityLevel: "", // Sedentary, Light, Moderate, Very Active, Extremely Active
    workoutFrequency: "",
    sleepDuration: "",
    sleepQuality: "", // Poor, Fair, Good, Excellent
    stressLevel: "", // Low, Moderate, High
    
    // Medical History
    medicalConditions: [], // Array of conditions
    medications: [],
    surgeries: [],
    allergies: [],
    familyHistory: [],
    
    // Fitness Goals
    primaryGoal: "", // Weight Loss, Muscle Gain, Maintenance, etc.
    targetWeight: "",
    weeklyGoal: "",
    preferredWorkoutType: [], // Array of workout types
    
    // Dietary Preferences
    dietaryRestrictions: [], // Vegetarian, Vegan, etc.
    foodAllergies: [],
    mealPreference: "", // 3 meals, 5 meals, etc.
    waterIntake: "",
    supplementsUsed: [],
    
    // Recovery & Wellness
    recoveryMethods: [], // Stretching, Massage, etc.
    injuryHistory: [],
    mobilityLimitations: [],
    
    // Tracking Preferences
    preferredMeasurementUnit: "", // Metric/Imperial
    trackingFrequency: "", // Daily, Weekly, etc.
    notificationPreferences: []
  });

  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  // Auth state and redirect if not logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
      } else {
        setUser(currentUser);
        const profileData = await fetchProfileData(currentUser.uid);
        if (profileData) {
          setFormData(prevData => ({
            ...prevData,
            ...profileData
          }));
          setPhotoURL(profileData.photoURL || null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  // Fetch user profile data
  useEffect(() => {
    const fetchData = async () => {
      if (user?.uid) {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          setFormData(snap.data());
          setPhotoURL(snap.data().photoURL || null);
        }
      }
    };
    fetchData();
  }, [user]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateForm = () => {
    const required = ['age', 'gender', 'height', 'weight'];
    const missing = required.filter(field => !formData[field]);
    
    if (missing.length > 0) {
      alert(`Please fill in the following required fields: ${missing.join(', ')}`);
      return false;
    }

    if (formData.age && (formData.age < 13 || formData.age > 120)) {
      alert('Please enter a valid age between 13 and 120');
      return false;
    }

    if (formData.weight && (formData.weight < 20 || formData.weight > 500)) {
      alert('Please enter a valid weight');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!user?.uid) return;
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const success = await saveProfileData(user.uid, formData);
      if (success) {
        setEditMode(false);
        
        // Generate quick analysis
        const profileAnalysis = generateProfileAnalysis(formData);
        setAnalysis(profileAnalysis);
        setShowAnalysis(true);
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      alert('Error updating profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!profileImage) return;
    setUploading(true);
    const imageRef = ref(storage, `profileImages/${user.uid}/${profileImage.name}`);
    await uploadBytes(imageRef, profileImage);
    const imageUrl = await getDownloadURL(imageRef);
    setFormData((prev) => ({ ...prev, profileImage: imageUrl }));
    setUploading(false);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      
      // Update user profile with new photo URL
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        ...formData,
        photoURL: data.url
      }, { merge: true });

      setPhotoURL(data.url);
    } catch (error) {
      console.error("Error uploading photo:", error);
      alert('Failed to upload photo: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleMultiSelectChange = (e) => {
    const options = e.target.options;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selected.push(options[i].value);
      }
    }
    setFormData(prev => ({ ...prev, [e.target.name]: selected }));
  };

  const getOptionsForField = (field) => {
    const options = {
      medicalConditions: [
        { 
          value: 'Asthma',
          format: 'Select severity',
          subOptions: [
            { value: 'Mild Asthma', description: 'Occasional symptoms, easily controlled' },
            { value: 'Moderate Asthma', description: 'Daily symptoms, regular medication needed' },
            { value: 'Severe Asthma', description: 'Frequent symptoms, affects daily activities' }
          ]
        },
        { 
          value: 'Diabetes',
          format: 'Select type',
          subOptions: [
            { value: 'Type 1 Diabetes', description: 'Insulin-dependent diabetes' },
            { value: 'Type 2 Diabetes', description: 'Adult-onset diabetes' },
            { value: 'Prediabetes', description: 'Higher than normal blood sugar' }
          ]
        },
        { value: 'Hypertension', format: 'Include BP range' },
        { value: 'Heart Disease', format: 'Specify condition' },
        { value: 'Arthritis', format: 'Include affected areas' },
        { value: 'None', format: '' }
      ],
      allergies: [
        { value: 'Peanuts', format: 'Severity: Mild/Moderate/Severe' },
        { value: 'Dairy', format: 'Specify reaction type' },
        { value: 'Gluten', format: 'Celiac/Sensitivity' },
        { value: 'Shellfish', format: 'Specify types' },
        { value: 'None', format: '' }
      ],
      preferredWorkoutType: [
        { value: 'Strength Training', format: 'Weight lifting, Bodyweight exercises' },
        { value: 'Cardio', format: 'Running, Swimming, Cycling' },
        { value: 'HIIT', format: 'High-Intensity Interval Training' },
        { 
          value: 'Yoga',
          format: 'Select specific style',
          subOptions: [
            { value: 'Hatha Yoga', description: 'Traditional gentle practice' },
            { value: 'Vinyasa Flow', description: 'Dynamic flowing movements' },
            { value: 'Ashtanga Yoga', description: 'Vigorous, structured practice' },
            { value: 'Yin Yoga', description: 'Deep tissue stretching' },
            { value: 'Power Yoga', description: 'Strength-focused practice' },
            { value: 'Kundalini Yoga', description: 'Spiritual and physical practice' },
            { value: 'Restorative Yoga', description: 'Relaxation focused' },
            { value: 'Hot Yoga', description: 'Practiced in heated room' }
          ]
        },
        { value: 'Sports', format: 'Specify type' }
      ],
      dietaryRestrictions: [
        {
          value: 'Vegetarian',
          format: 'Select type',
          subOptions: [
            { value: 'Lacto-Ovo', description: 'Includes dairy and eggs' },
            { value: 'Lacto', description: 'Includes dairy, no eggs' },
            { value: 'Ovo', description: 'Includes eggs, no dairy' },
            { value: 'Pescatarian', description: 'Includes fish' }
          ]
        },
        {
          value: 'Vegan',
          format: 'Select focus',
          subOptions: [
            { value: 'Whole-Food Plant-Based', description: 'Minimally processed foods' },
            { value: 'Raw Vegan', description: 'Uncooked plant foods' },
            { value: 'High-Carb Low-Fat', description: 'Emphasis on fruits and starches' },
            { value: 'Junk-Food Vegan', description: 'Includes processed vegan foods' }
          ]
        },
        { value: 'Keto', format: '' },
        { value: 'Paleo', format: '' },
        { value: 'Gluten-Free', format: '' },
        { value: 'Dairy-Free', format: '' }
      ],
      recoveryMethods: [
        {
          value: 'Massage',
          format: 'Select type',
          subOptions: [
            { value: 'Swedish Massage', description: 'General relaxation and recovery' },
            { value: 'Deep Tissue', description: 'Targets muscle knots and tension' },
            { value: 'Sports Massage', description: 'Athletic performance focused' },
            { value: 'Self-Massage', description: 'Using foam roller or massage tools' }
          ]
        },
        {
          value: 'Stretching',
          format: 'Select type',
          subOptions: [
            { value: 'Dynamic Stretching', description: 'Active movement stretches' },
            { value: 'Static Stretching', description: 'Hold position stretches' },
            { value: 'PNF Stretching', description: 'Contract-relax technique' },
            { value: 'Mobility Work', description: 'Joint mobility exercises' }
          ]
        }
      ],
      supplementsUsed: [
        {
          value: 'Protein',
          format: 'Select type and timing',
          subOptions: [
            { value: 'Whey Protein', description: 'Fast-absorbing, post-workout' },
            { value: 'Casein Protein', description: 'Slow-absorbing, before bed' },
            { value: 'Plant Protein', description: 'Vegan friendly options' },
            { value: 'BCAA', description: 'Branch Chain Amino Acids' }
          ]
        },
        {
          value: 'Vitamins',
          format: 'Select specific vitamins',
          subOptions: [
            { value: 'Vitamin D', description: 'Bone health, immunity' },
            { value: 'B Complex', description: 'Energy, metabolism' },
            { value: 'Vitamin C', description: 'Immunity, antioxidant' },
            { value: 'Multivitamin', description: 'Daily essential nutrients' }
          ]
        }
      ],

      // Add measurement units and formats
      measurements: {
        weight: { unit: 'kg/lbs', format: '70.5' },
        height: { unit: 'cm/ft-in', format: '175 or 5\'9"' },
        waistCircumference: { unit: 'cm/in', format: '82.5' },
        bodyFatPercentage: { unit: '%', format: '18.5' },
        bloodPressure: { format: '120/80', unit: 'mmHg' },
        restingHeartRate: { format: '65', unit: 'bpm' },
        waterIntake: { unit: 'L/day', format: '2.5' }
      }
    };

    return options[field] || [];
  };

  // Replace the renderFormField function with:
  const renderFormField = (field, value) => {
    const multiSelectFields = [
      'medicalConditions', 
      'allergies', 
      'preferredWorkoutType', 
      'dietaryRestrictions', 
      'recoveryMethods', 
      'supplementsUsed'
    ];

    const handleFieldChange = (fieldName, newValue) => {
      setFormData(prev => ({ ...prev, [fieldName]: newValue }));
    };

    return (
      <FormField
        field={field}
        value={value}
        editMode={editMode}
        options={getOptionsForField(field)}
        measurementInfo={getOptionsForField('measurements')[field]}
        onChange={handleFieldChange}
        multiSelectFields={multiSelectFields}
      />
    );
  };

  const saveProfileData = async (userId, data) => {
    try {
      const userRef = doc(db, "users", userId);
      await setDoc(userRef, {
        ...data,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      return true;
    } catch (error) {
      console.error("Error saving profile:", error);
      return false;
    }
  };

  const fetchProfileData = async (userId) => {
    try {
      const userRef = doc(db, "users", userId);
      const docSnap = await getDoc(userRef);
      return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
  };

  const generateProfileAnalysis = (data) => {
    const analysis = {
      summary: [],
      recommendations: []
    };

    // Basic health insights
    if (data.bmi > 25) {
      analysis.summary.push("Your BMI indicates you might benefit from weight management strategies");
    }

    // Activity level analysis
    if (data.activityLevel === "Sedentary") {
      analysis.summary.push("Your activity level is currently sedentary");
      analysis.recommendations.push("Consider increasing daily physical activity");
    }

    // Sleep analysis
    if (data.sleepDuration < 7) {
      analysis.summary.push("You might not be getting enough sleep");
      analysis.recommendations.push("Aim for 7-9 hours of sleep per night");
    }

    return analysis;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-lg text-gray-600">Loading...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-10 text-center">
          Profile Settings
        </h1>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          {/* Profile Photo Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-md">
                {photoURL ? (
                  <Image
                    src={photoURL}
                    alt="Profile"
                    width={128}
                    height={128}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-50">
                    <FiUser className="w-12 h-12 text-blue-300" />
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full text-white shadow-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <FiCamera className="w-4 h-4" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                accept="image/*"
                className="hidden"
              />
            </div>
            {uploading && (
              <p className="text-sm text-blue-600 mt-2">Uploading photo...</p>
            )}
          </div>

          {/* User Details Section */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <FiUser className="w-5 h-5 text-gray-500 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{user?.displayName || "N/A"}</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <FiMail className="w-5 h-5 text-gray-500 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Organized Form Fields */}
          <div className="space-y-8">
            {/* Basic Information Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
                Basic Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {['age', 'gender', 'dateOfBirth', 'height', 'weight'].map((field) => (
                  <div key={field} className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                      {field.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    {renderFormField(field, formData[field])}
                  </div>
                ))}
              </div>
            </div>

            {/* Body Measurements Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
                Body Measurements
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {['waistCircumference', 'hipCircumference', 'chestCircumference', 'bodyFatPercentage'].map((field) => (
                  <div key={field} className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                      {field.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    {renderFormField(field, formData[field])}
                  </div>
                ))}
              </div>
            </div>

            {/* Health Metrics Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
                Health Metrics
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {['bloodPressure', 'restingHeartRate', 'bloodType'].map((field) => (
                  <div key={field} className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                      {field.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    {renderFormField(field, formData[field])}
                  </div>
                ))}
              </div>
            </div>

            {/* Lifestyle Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
                Lifestyle & Activity
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {['occupation', 'activityLevel', 'workoutFrequency', 'sleepDuration', 'sleepQuality', 'stressLevel'].map((field) => (
                  <div key={field} className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                      {field.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    {renderFormField(field, formData[field])}
                  </div>
                ))}
              </div>
            </div>

            {/* Medical History Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
                Medical History
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {['medicalConditions', 'medications', 'surgeries', 'allergies', 'familyHistory'].map((field) => (
                  <div key={field} className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                      {field.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    {renderFormField(field, formData[field])}
                  </div>
                ))}
              </div>
            </div>

            {/* Fitness Goals Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
                Fitness Goals
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {['primaryGoal', 'targetWeight', 'weeklyGoal', 'preferredWorkoutType'].map((field) => (
                  <div key={field} className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                      {field.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    {renderFormField(field, formData[field])}
                  </div>
                ))}
              </div>
            </div>

            {/* Dietary Preferences Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
                Dietary Preferences
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {['dietaryRestrictions', 'foodAllergies', 'mealPreference', 'waterIntake', 'supplementsUsed'].map((field) => (
                  <div key={field} className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                      {field.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    {renderFormField(field, formData[field])}
                  </div>
                ))}
              </div>
            </div>

            {/* Recovery & Wellness Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
                Recovery & Wellness
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {['recoveryMethods', 'injuryHistory', 'mobilityLimitations'].map((field) => (
                  <div key={field} className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                      {field.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    {renderFormField(field, formData[field])}
                  </div>
                ))}
              </div>
            </div>

            {/* Preferences Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
                Preferences
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {['preferredMeasurementUnit', 'trackingFrequency', 'notificationPreferences'].map((field) => (
                  <div key={field} className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                      {field.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    {renderFormField(field, formData[field])}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center mt-8 space-x-4">
            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <FiEdit2 className="w-4 h-4 mr-2" />
                Edit Profile
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={loading}
                className={`flex items-center px-6 py-2 ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700'
                } text-white rounded-lg transition-colors duration-200`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            )}
          </div>

          {/* Profile Analysis Section */}
          {showAnalysis && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                <h3 className="text-2xl font-semibold mb-4">Profile Analysis</h3>
                
                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-2">Key Insights:</h4>
                  <ul className="list-disc pl-5 space-y-2">
                    {analysis?.summary.map((item, index) => (
                      <li key={index} className="text-gray-600">{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-2">Recommendations:</h4>
                  <ul className="list-disc pl-5 space-y-2">
                    {analysis?.recommendations.map((item, index) => (
                      <li key={index} className="text-gray-600">{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => router.push('/recommendation')}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    View Detailed Recommendations
                  </button>
                  <button
                    onClick={() => setShowAnalysis(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}