import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrashAlt } from "react-icons/fa";

const ExpenseTrackerModal = ({ tripId, closeModal, group }) => {
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({
    title: "",
    amount: "",
    date: "",
    paidBy: "",
    category: "Food", // Default category
    notes: "",
  });
  const [editingExpense, setEditingExpense] = useState(null);

  useEffect(() => {
    // Fetch the existing expenses
    const fetchExpenses = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/expanses/${tripId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setExpenses(response.data.data);
      } catch (error) {
        console.error("Error fetching expenses", error);
      }
    };

    fetchExpenses();
  }, [tripId]);

  // Function to handle form input changes
  const handleChange = (e) => {
    setNewExpense({
      ...newExpense,
      [e.target.name]: e.target.value,
    });
  };

  // Function to add a new expense
  const handleAddExpense = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/expanses/add/${tripId}`,
        newExpense,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Update expenses state with the newly added expense
      setExpenses([...expenses, response.data.data]);

      // Reset form after adding expense
      resetFormAndCloseModal();
    } catch (error) {
      console.error("Error adding expense", error);
    }
  };

  // Function to delete an expense
  const handleDeleteExpense = async (expenseId) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/expanses/delete/${expenseId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setExpenses(expenses.filter((expense) => expense._id !== expenseId));
    } catch (error) {
      console.error("Error deleting expense", error);
    }
  };

  // Open modal with pre-filled data for editing an expense
  const openEditModal = (expense) => {
    setNewExpense({
      title: expense.title,
      amount: expense.amount,
      date: expense.date,
      paidBy: expense.paidBy._id,
      category: expense.category,
      notes: expense.notes || "",
    });
    setEditingExpense(expense); // Set the expense to edit
  };

  // Update an existing expense
  const handleUpdateExpense = async () => {
    try {
      await handleEditExpense(editingExpense._id, newExpense);
      resetFormAndCloseModal(); // Close modal after update
    } catch (error) {
      console.error("Error updating expense", error);
    }
  };

  // Function to edit an expense
  const handleEditExpense = async (expenseId, updatedExpenseData) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/expanses/update/${expenseId}`,
        updatedExpenseData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Update the expenses state after a successful edit
      const updatedExpense = response.data.data;
      setExpenses((prevExpenses) =>
        prevExpenses.map((expense) =>
          expense._id === updatedExpense._id ? updatedExpense : expense
        )
      );
    } catch (error) {
      console.error("Error updating expense", error);
    }
  };

  // Reset form fields and close modal
  const resetFormAndCloseModal = () => {
    setEditingExpense(null); // Clear editing state
    setNewExpense({
      title: "",
      amount: "",
      date: "",
      paidBy: "",
      category: "Food",
      notes: "",
    });
    closeModal(); // Close modal
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-11/12 lg:w-2/3 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">
          {editingExpense ? "Edit Expense" : "Expense Tracker"}
        </h2>

        {/* Expense List */}
        <table className="w-full text-left mb-6">
          <thead>
            <tr>
              <th className="border-b p-2">Title</th>
              <th className="border-b p-2">Amount</th>
              <th className="border-b p-2">Paid By</th>
              <th className="border-b p-2">Category</th>
              <th className="border-b p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense._id}>
                <td className="border-b p-2">{expense.title}</td>
                <td className="border-b p-2">${expense.amount}</td>
                {/* Display user's name who paid */}
                <td className="border-b p-2">
                  {expense.paidBy
                    ? `${expense.paidBy.firstName} ${expense.paidBy.lastName}`
                    : "Unknown"}
                </td>
                <td className="border-b p-2">{expense.category}</td>
                <td className="border-b p-2">
                  <FaEdit
                    className="inline mx-2 cursor-pointer"
                    onClick={() => openEditModal(expense)}
                  />
                  <FaTrashAlt
                    className="inline mx-2 cursor-pointer text-red-500"
                    onClick={() => handleDeleteExpense(expense._id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Add/Edit Expense Form */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">
            {editingExpense ? "Edit Expense" : "Add New Expense"}
          </h3>
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={newExpense.title}
            onChange={handleChange}
            className="w-full p-2 mb-2 border rounded"
          />
          <input
            type="number"
            name="amount"
            placeholder="Amount"
            value={newExpense.amount}
            onChange={handleChange}
            className="w-full p-2 mb-2 border rounded"
          />
          <input
            type="date"
            name="date"
            value={newExpense.date}
            onChange={handleChange}
            className="w-full p-2 mb-2 border rounded"
          />

          {/* Paid By Dropdown */}
          <select
            name="paidBy"
            value={newExpense.paidBy}
            onChange={handleChange}
            className="w-full p-2 mb-2 border rounded"
          >
            <option value="">Select who paid</option>
            {group?.users?.map((member) => (
              <option key={member._id} value={member._id}>
                {member.firstName} {member.lastName}
              </option>
            ))}
          </select>

          <select
            name="category"
            value={newExpense.category}
            onChange={handleChange}
            className="w-full p-2 mb-2 border rounded"
          >
            <option value="Food">Food</option>
            <option value="Transport">Transport</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Accommodation">Accommodation</option>
            <option value="Misc">Miscellaneous</option>
          </select>

          <input
            type="text"
            name="notes"
            placeholder="Notes (optional)"
            value={newExpense.notes}
            onChange={handleChange}
            className="w-full p-2 mb-2 border rounded"
          />
          <button
            onClick={editingExpense ? handleUpdateExpense : handleAddExpense}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            {editingExpense ? "Update Expense" : "Add Expense"}
          </button>
        </div>

        {/* Close Button */}
        <button
          onClick={resetFormAndCloseModal}
          className="absolute text-3xl top-8 right-8"
        >
          ❌
        </button>
      </div>
    </div>
  );
};

export default ExpenseTrackerModal;
