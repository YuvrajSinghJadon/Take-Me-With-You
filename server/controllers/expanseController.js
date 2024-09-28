import Expense from "../models/expanseModel.js";
import Group from "../models/Groups.js";
// Add a new expense
export const addExpense = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { title, amount, category, paidBy, notes, date } = req.body;
    // Log the incoming data
    console.log("Adding new expense with the following details:");
    console.log({
      title,
      amount,
      category,
      paidBy,
      notes,
      date,
      groupId: tripId,
    });
    const newExpense = new Expense({
      title,
      amount,
      category,
      paidBy,
      notes,
      date,
      groupId: tripId,
    });

    const savedExpense = await newExpense.save();
    console.log("Expense saved successfully:", savedExpense);

    res.status(201).json({ success: true, data: savedExpense });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to add expense", error });
  }
};

// Get all expenses for a trip
export const getExpenses = async (req, res) => {
  try {
    const { tripId } = req.params;

    const expenses = await Expense.find({ groupId: tripId }).populate(
      "paidBy",
      "firstName lastName"
    );
    if (!expenses) {
      return res
        .status(404)
        .json({ success: false, message: "No expenses found for this trip." });
    }
    res.status(200).json({ success: true, data: expenses });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch expenses", error });
  }
};

// Update an expense
export const updateExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const { title, amount, category, notes, date } = req.body;

    const updatedExpense = await Expense.findByIdAndUpdate(
      expenseId,
      { title, amount, category, notes, date },
      { new: true }
    );

    if (!updatedExpense) {
      return res
        .status(404)
        .json({ success: false, message: "Expense not found" });
    }

    res.status(200).json({ success: true, data: updatedExpense });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to update expense", error });
  }
};

// Delete an expense
export const deleteExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;

    const deletedExpense = await Expense.findByIdAndDelete(expenseId);
    if (!deletedExpense) {
      return res
        .status(404)
        .json({ success: false, message: "Expense not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Expense deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to delete expense", error });
  }
};

// Get summary of expenses (who paid what)
export const getExpenseSummary = async (req, res) => {
  try {
    const { tripId } = req.params;

    // Fetch all expenses for the group
    const expenses = await Expense.find({ groupId: tripId }).populate(
      "paidBy",
      "firstName lastName"
    );

    // Summarize each user's total payments
    const summary = {};
    expenses.forEach((expense) => {
      if (!summary[expense.paidBy._id]) {
        summary[expense.paidBy._id] = {
          user: expense.paidBy,
          totalPaid: 0,
        };
      }
      summary[expense.paidBy._id].totalPaid += expense.amount;
    });

    res.status(200).json({ success: true, data: Object.values(summary) });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get expense summary",
      error,
    });
  }
};

// Split expenses between members
export const splitExpenses = async (req, res) => {
  try {
    const { tripId } = req.params;

    // Fetch all expenses for the group
    const expenses = await Expense.find({ groupId: tripId }).populate(
      "paidBy",
      "firstName lastName"
    );

    // Fetch group members
    const group = await Group.findById(tripId).populate(
      "users",
      "firstName lastName"
    );
    const totalMembers = group.users.length;

    // Calculate each user's owed/paid amount
    const balances = {};
    expenses.forEach((expense) => {
      const share = expense.amount / totalMembers;

      group.users.forEach((user) => {
        if (!balances[user._id]) {
          balances[user._id] = {
            user,
            balance: 0,
          };
        }

        if (user._id.equals(expense.paidBy._id)) {
          balances[user._id].balance += expense.amount - share;
        } else {
          balances[user._id].balance -= share;
        }
      });
    });

    res.status(200).json({ success: true, data: Object.values(balances) });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to split expenses", error });
  }
};
