import { app } from "./firebaseconfig";
import { getFirestore } from "firebase/firestore";

export const db = getFirestore(app);
