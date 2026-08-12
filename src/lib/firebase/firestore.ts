import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  DocumentData,
} from "firebase/firestore";
import { db } from "./config";

// Types
export interface MultilingualText {
  ur: string;
  ar: string;
  en: string;
}

export interface Department {
  id?: string;
  title: MultilingualText;
  description: MultilingualText;
  imagePath?: string;
  isActive: boolean;
  isArchived: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Course {
  id?: string;
  departmentId: string;
  title: MultilingualText;
  description: MultilingualText;
  duration: MultilingualText;
  eligibility: MultilingualText;
  admissionStatus: "open" | "closed";
  assignedTeacherIds: string[];
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface User {
  id?: string;
  name: string;
  email: string;
  role: "student" | "teacher" | "admin" | "staff";
  enrolledCourseIds?: string[];
  departmentIds?: string[];
  createdAt: Timestamp;
}

export interface Admission {
  id?: string;
  userId: string;
  courseId: string;
  departmentId: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone?: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: Timestamp;
  reviewedAt?: Timestamp;
}

// Helpers
export const getDepartments = async (): Promise<Department[]> => {
  // Simple collection fetch — no composite index needed.
  // We filter isArchived and sort by createdAt client-side to avoid
  // the "FirebaseError: The query requires an index" error.
  const querySnapshot = await getDocs(collection(db, "departments"));
  const allDepts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Department));
  return allDepts
    .filter(d => !d.isArchived)
    .sort((a, b) => {
      const aTime = a.createdAt?.seconds ?? 0;
      const bTime = b.createdAt?.seconds ?? 0;
      return bTime - aTime; // desc
    });
};

export const addDepartment = async (department: Omit<Department, "id" | "createdAt" | "updatedAt">) => {
  return await addDoc(collection(db, "departments"), {
    ...department,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
};

export const getCoursesByDepartment = async (departmentId: string): Promise<Course[]> => {
  const q = query(collection(db, "courses"), where("departmentId", "==", departmentId), where("isActive", "==", true));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
};
