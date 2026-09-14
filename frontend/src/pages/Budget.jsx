import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Budget() {
  const navigate = useNavigate();

  const [budgets, setBudgets] = useState([]);
  const [category, setCategory] = useState("Food");
  const [amount, setAmount] = useState("");
  const [startDate, setStartDate] = useState("2026-09-01T00:00:00");
  const [endDate, setEndDate] = useState("2026-09-30T23:59:59");
  const [editingId, setEditingId] = useState(null);

  const token = localStorage.getItem("token");

  const loadBudgets = () => {
    fetch("http://127.0.0.1:8000/budgets/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setBudgets(data));
  };

  useEffect(() => {
    loadBudgets();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    const url = editingId
      ? `http://127.0.0.1:8000/budgets/${editingId}`
      : "http://127.0.0.1:8000/budgets/";

    fetch(url, {
      method: editingId ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        category: category,
        amount_limit: Number(amount),
        start_date: startDate,
        end_date: endDate,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Invalid budget");
        return res.json();
      })
      .then(() => {
        setAmount("");
        setCategory("Food");
        setStartDate("2026-09-01T00:00:00");
        setEndDate("2026-09-30T23:59:59");
        setEditingId(null);
        loadBudgets();
      })
      .catch(() => alert("Failed to save budget"));
  };

  const editBudget = (item) => {
    setEditingId(item.budget_id);
    setAmount(item.amount_limit);
    setCategory(item.category);
    setStartDate(item.start_date);
    setEndDate(item.end_date);
  };

  const deleteBudget = (id) => {
    if (!window.confirm("Delete this budget?")) {
      return;
    }

    fetch(`http://127.0.0.1:8000/budgets/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Delete failed");
        loadBudgets();
      })
      .catch(() => alert("Failed to delete budget"));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setAmount("");
    setCategory("Food");
    setStartDate("2026-09-01T00:00:00");
    setEndDate("2026-09-30T23:59:59");
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>📊 Budgets</h1>

        <form onSubmit={handleSubmit}>
          <input
            type="number"
            placeholder="Budget Amount"
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
            type="datetime-local"
            value={startDate.slice(0, 16)}
            onChange={(e) => setStartDate(e.target.value + ":00")}
          />

          <input
            type="datetime-local"
            value={endDate.slice(0, 16)}
            onChange={(e) => setEndDate(e.target.value + ":00")}
          />

          <button type="submit">
            {editingId ? "Update Budget" : "Add Budget"}
          </button>

          {editingId && (
            <button type="button" onClick={cancelEdit}>
              Cancel
            </button>
          )}
        </form>

        <h2>My Budgets</h2>

        {budgets.map((item) => (
          <div key={item.budget_id}>
            <p>
              <strong>{item.category}</strong> - ₹{item.amount_limit}
            </p>

            <button onClick={() => editBudget(item)}>
              Edit
            </button>

            <button onClick={() => deleteBudget(item.budget_id)}>
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

export default Budget;