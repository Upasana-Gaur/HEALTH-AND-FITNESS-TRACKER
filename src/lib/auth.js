import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth'
import { auth, googleProvider } from './firebase'

export const registerUser = async (email, password) => {
  return await createUserWithEmailAndPassword(auth, email, password)
}

export const loginUser = async (email, password) => {
  return await signInWithEmailAndPassword(auth, email, password)
}

export const loginWithGoogle = async () => {
  return await signInWithPopup(auth, googleProvider)
}

export const logoutUser = async () => {
  return await signOut(auth)
}
