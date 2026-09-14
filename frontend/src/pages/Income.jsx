import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Income() {
  const navigate = useNavigate();

  const [income, setIncome] = useState([]);
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("Pocket Money");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null);

  const token = localStorage.getItem("token");

  const loadIncome = () => {
    fetch("http://127.0.0.1:8000/income/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setIncome(data));
  };

  useEffect(() => {
    loadIncome();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    const url = editingId
      ? `http://127.0.0.1:8000/income/${editingId}`
      : "http://127.0.0.1:8000/income/";

    fetch(url, {
      method: editingId ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        amount: Number(amount),
        source: source,
        description: description,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Invalid income");
        return res.json();
      })
      .then(() => {
        setAmount("");
        setSource("Pocket Money");
        setDescription("");
        setEditingId(null);
        loadIncome();
      })
      .catch(() => alert("Failed to save income"));
  };

  const editIncome = (item) => {
    setEditingId(item.income_id);
    setAmount(item.amount);
    setSource(item.source);
    setDescription(item.description || "");
  };

  const deleteIncome = (id) => {
    if (!window.confirm("Delete this income?")) {
      return;
    }

    fetch(`http://127.0.0.1:8000/income/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Delete failed");
        loadIncome();
      })
      .catch(() => alert("Failed to delete income"));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setAmount("");
    setSource("Pocket Money");
    setDescription("");
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>💰 Income</h1>

        <form onSubmit={handleSubmit}>
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
          >
            <option>Pocket Money</option>
            <option>Scholarship</option>
            <option>Freelance Income</option>
          </select>

          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <button type="submit">
            {editingId ? "Update Income" : "Add Income"}
          </button>

          {editingId && (
            <button type="button" onClick={cancelEdit}>
              Cancel
            </button>
          )}
        </form>

        <h2>Income History</h2>

        {income.map((item) => (
          <div key={item.income_id}>
            <p>
              ₹{item.amount} - {item.source}
            </p>

            <button onClick={() => editIncome(item)}>
              Edit
            </button>

            <button onClick={() => deleteIncome(item.income_id)}>
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

export default Income;