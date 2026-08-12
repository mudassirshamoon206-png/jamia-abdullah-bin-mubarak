"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import styles from "./page.module.css";
import { useTranslations } from "next-intl";

interface SalaryPayment {
  id: string;
  employeeName: string;
  role: string;
  amount: number;
  month: string;
  status: "paid" | "pending";
  paidAt?: any;
}

export default function FinanceDashboard() {
  const t = useTranslations("Navigation");
  const [payments, setPayments] = useState<SalaryPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  const [formData, setFormData] = useState({
    employeeName: "",
    role: "teacher",
    amount: "",
    month: "",
    status: "paid"
  });

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "salaryPayments"), orderBy("month", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SalaryPayment));
      setPayments(data);
    } catch (error) {
      console.error("Error fetching payments", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "salaryPayments"), {
        ...formData,
        amount: Number(formData.amount),
        paidAt: formData.status === "paid" ? serverTimestamp() : null,
        createdAt: serverTimestamp()
      });
      setShowModal(false);
      fetchPayments();
      setFormData({ employeeName: "", role: "teacher", amount: "", month: "", status: "paid" });
    } catch (error) {
      console.error("Error adding payment", error);
    }
  };

  return (
    <div className={styles.financeContainer}>
      <div className={styles.header}>
        <h2>Finance & Payroll</h2>
        <button className={styles.addBtn} onClick={() => setShowModal(true)}>
          + Record Payment
        </button>
      </div>

      <div className={styles.statsOverview}>
        <div className={styles.statCard}>
          <h3>Total Paid This Month</h3>
          <p>Rs. 150,000</p>
        </div>
        <div className={styles.statCard}>
          <h3>Pending Payments</h3>
          <p>Rs. 45,000</p>
        </div>
      </div>

      <div className={styles.tableContainer}>
        {loading ? (
          <p>Loading records...</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Employee Name</th>
                <th>Role</th>
                <th>Month</th>
                <th>Amount (Rs.)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(payment => (
                <tr key={payment.id}>
                  <td>{payment.employeeName}</td>
                  <td className={styles.capitalize}>{payment.role}</td>
                  <td>{payment.month}</td>
                  <td>{payment.amount.toLocaleString()}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[payment.status]}`}>
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={5} className={styles.emptyState}>No salary records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Record Salary Payment</h3>
            <form onSubmit={handleAddPayment} className={styles.form}>
              <div className={styles.inputGroup}>
                <label>Employee Name</label>
                <input required type="text" value={formData.employeeName} onChange={e => setFormData({...formData, employeeName: e.target.value})} />
              </div>
              <div className={styles.inputGroup}>
                <label>Role</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                  <option value="teacher">Teacher</option>
                  <option value="staff">Staff</option>
                </select>
              </div>
              <div className={styles.inputGroup}>
                <label>Amount (Rs.)</label>
                <input required type="number" min="0" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
              </div>
              <div className={styles.inputGroup}>
                <label>Month (YYYY-MM)</label>
                <input required type="month" value={formData.month} onChange={e => setFormData({...formData, month: e.target.value})} />
              </div>
              <div className={styles.inputGroup}>
                <label>Status</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className={styles.saveBtn}>Save Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
