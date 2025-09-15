import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, collection, getDoc, addDoc, getDocs, query, orderBy, deleteDoc, doc, onSnapshot } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCza5MXXRNA1NTbhd_DNZo_aEmv6YcZOdU",
    authDomain: "health-and-fitness-track-ba83b.firebaseapp.com",
    projectId: "health-and-fitness-track-ba83b",
    storageBucket: "health-and-fitness-track-ba83b.firebasestorage.app",
    messagingSenderId: "916895725571",
    appId: "1:916895725571:web:23cc6601a34adbe097f636",
    measurementId: "G-ZQHDH8SE3T"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);

const addFeedback = async (feedback) => {
  const docRef = await addDoc(collection(db, "feedback"), feedback);
  return docRef.id;
};

const getFeedbacks = async () => {
  const feedbackRef = collection(db, "feedback");
  const q = query(feedbackRef, orderBy("timestamp", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

const deleteFeedback = async (id) => {
  await deleteDoc(doc(db, "feedback", id));
};

const getUserData = async (uid) => {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
};

const saveUserData = async (uid, data) => {
  await setDoc(doc(db, "users", uid), data, { merge: true });
};

const listenToUserData = (uid, callback) => {
  const docRef = doc(db, "users", uid);
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data());
    }
  });
};

export { auth, googleProvider, db, addFeedback, getFeedbacks, deleteFeedback, getUserData, saveUserData, listenToUserData };
