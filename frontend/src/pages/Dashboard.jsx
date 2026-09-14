import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [budgets, setBudgets] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    fetch("http://127.0.0.1:8000/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unauthorized");
        }
        return response.json();
      })
      .then((data) => {
        setUser(data);

        return Promise.all([
          fetch("http://127.0.0.1:8000/dashboard/", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch("http://127.0.0.1:8000/budgets/", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);
      })
      .then(async ([dashboardResponse, budgetResponse]) => {
        if (!dashboardResponse.ok || !budgetResponse.ok) {
          throw new Error("Dashboard error");
        }

        const dashboardData = await dashboardResponse.json();
        const budgetData = await budgetResponse.json();

        setDashboard(dashboardData);
        setBudgets(budgetData);
      })
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/");
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  if (!user || !dashboard) {
    return <p>Loading...</p>;
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>💰 BudgetBuddy</h1>

        <h2>Welcome, {user.email}! 👋</h2>

        <hr />

        <h3>Financial Summary</h3>

        <p>
          <strong>Total Income:</strong> ₹{dashboard.total_income}
        </p>

        <p>
          <strong>Total Expenses:</strong> ₹{dashboard.total_expenses}
        </p>

        <p>
          <strong>Remaining Balance:</strong> ₹
          {dashboard.remaining_balance}
        </p>

        <h3>Category-wise Expenses</h3>

        {Object.keys(dashboard.category_wise_expenses).length === 0 ? (
          <p>No expenses yet.</p>
        ) : (
          Object.entries(dashboard.category_wise_expenses).map(
            ([category, amount]) => (
              <p key={category}>
                <strong>{category}:</strong> ₹{amount}
              </p>
            )
          )
        )}

        <h3>Budget Summary</h3>

        {budgets.length === 0 ? (
          <p>No budgets yet.</p>
        ) : (
          budgets.map((budget) => (
            <p key={budget.budget_id}>
              <strong>{budget.category}:</strong> ₹{budget.amount_limit}
            </p>
          ))
        )}

        <h3>Recent Transactions</h3>

        {dashboard.recent_transactions.length === 0 ? (
          <p>No transactions yet.</p>
        ) : (
          dashboard.recent_transactions.map((transaction, index) => (
            <p key={index}>
              <strong>
                {transaction.type === "income" ? "Income" : "Expense"}
              </strong>
              {" - "}
              ₹{transaction.amount}
              {" - "}
              {transaction.category_or_source}
            </p>
          ))
        )}

        <hr />

        <h3>Manage Finances</h3>

        <button onClick={() => navigate("/income")}>
          Income
        </button>

        <button onClick={() => navigate("/expenses")}>
          Expenses
        </button>

        <button onClick={() => navigate("/budgets")}>
          Budgets
        </button>

        <hr />

        <p>
          <strong>User ID:</strong> {user.user_id}
        </p>

        <p>
          <strong>Role:</strong> {user.role}
        </p>

        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}

export default Dashboard;