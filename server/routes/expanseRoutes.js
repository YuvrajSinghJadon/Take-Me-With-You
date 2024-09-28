import express from "express";

const router = express.Router();

import {
  addExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
  splitExpenses,
  getExpenseSummary,
} from "../controllers/expanseController.js";
import userAuth from "../middleware/authMiddleware.js";

// Route to add an expense
router.post("/add/:tripId", userAuth, addExpense);

// Route to get all expenses for a trip
router.get("/:tripId", userAuth, getExpenses);

// Route to update an expense
router.put("/update/:expenseId", userAuth, updateExpense);

// Route to delete an expense
router.delete("/delete/:expenseId", userAuth, deleteExpense);

// Route to calculate and get the split of expenses
router.get("/trips/:tripId/expenses/split", userAuth, splitExpenses);

// Route to get expense summary for group members
router.get("/trips/:tripId/expenses/summary", userAuth, getExpenseSummary);

export default router;
