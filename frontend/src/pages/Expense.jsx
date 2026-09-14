import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Expense() {
  const navigate = useNavigate();

  const [expenses, setExpenses] = useState([]);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null);

  const token = localStorage.getItem("token");

  const loadExpenses = () => {
    fetch("http://127.0.0.1:8000/expenses/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setExpenses(data));
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    const url = editingId
      ? `http://127.0.0.1:8000/expenses/${editingId}`
      : "http://127.0.0.1:8000/expenses/";

    fetch(url, {
      method: editingId ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        amount: Number(amount),
        category: category,
        description: description,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Invalid expense");
        return res.json();
      })
      .then(() => {
        setAmount("");
        setCategory("Food");
        setDescription("");
        setEditingId(null);
        loadExpenses();
      })
      .catch(() => alert("Failed to save expense"));
  };

  const editExpense = (item) => {
    setEditingId(item.expense_id);
    setAmount(item.amount);
    setCategory(item.category);
    setDescription(item.description || "");
  };

  const deleteExpense = (id) => {
    if (!window.confirm("Delete this expense?")) {
      return;
    }

    fetch(`http://127.0.0.1:8000/expenses/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Delete failed");
        loadExpenses();
      })
      .catch(() => alert("Failed to delete expense"));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setAmount("");
    setCategory("Food");
    setDescription("");
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>💸 Expenses</h1>

        <form onSubmit={handleSubmit}>
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>Food</option>
            <option>Travel</option>
            <option>Shopping</option>
            <option>Education</option>
            <option>Entertainment</option>
            <option>Miscellaneous</option>
          </select>

          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <button type="submit">
            {editingId ? "Update Expense" : "Add Expense"}
          </button>

          {editingId && (
            <button type="button" onClick={cancelEdit}>
              Cancel
            </button>
          )}
        </form>

        <h2>Expense History</h2>

        {expenses.map((item) => (
          <div key={item.expense_id}>
            <p>
              ₹{item.amount} - {item.category}
            </p>

            <button onClick={() => editExpense(item)}>
              Edit
            </button>

            <button onClick={() => deleteExpense(item.expense_id)}>
              Delete
            </button>
          </div>
        ))}

        <button onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export default Expense;