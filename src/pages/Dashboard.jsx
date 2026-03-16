import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
// import { useAuth } from "../hooks/useAuth";

function Dashboard() {
  // const { user, token } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalAmount: 0,
    totalRecharges: 0,
    totalTransfers: 0,
    recentTransactions: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    async function loadStats() {
      setLoading(true);
      try {
        const res = await API.get("/transactions", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = res.data || [];

        const recharges = data.filter((t) => t.type === "Recharge");
        const transfers = data.filter((t) => t.type === "Send Money");

        const rechargeAmount = recharges.reduce(
          (sum, t) => sum + parseFloat(t.amount || 0),
          0,
        );
        const transferAmount = transfers.reduce(
          (sum, t) => sum + parseFloat(t.amount || 0),
          0,
        );

        setStats({
          totalTransactions: data.length,
          totalAmount: rechargeAmount + transferAmount,
          totalRecharges: recharges.length,
          totalTransfers: transfers.length,
          rechargeAmount,
          transferAmount,
          recentTransactions: data.slice(0, 5),
        });
        setError("");
      } catch (err) {
        console.error("Failed to load stats:", err);
        setError("Unable to load dashboard data.");
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, 
  // [token, navigate]
);

  return (
    <div className="page">
      <h2>📊 Dashboard & Analytics</h2>

      {/* Balance Card */}
      {/* {user && ( */}
        <div className="balance-section">
          <div className="dashboard-balance-card">
            <div className="balance-header">
              <h3>💰 Account Balance</h3>
              <p className="balance-subtext">Current Balance</p>
            </div>
            <div className="balance-display">
              ₹{user.balance?.toFixed(2) || "0.00"}
            </div>
          </div>
        </div>
      {/* )} */}

      {error && <div className="error">{error}</div>}

      {loading && <div className="spinner"></div>}

      {!loading && (
        <>
          {/* Statistics Cards */}
          <div className="dashboard-stats">
            <div className="stat-card">
              <h3>Total Transactions</h3>
              <div className="stat-value">{stats.totalTransactions}</div>
              <p style={{ color: "#999", marginTop: "10px" }}>Total count</p>
            </div>

            <div className="stat-card">
              <h3>Total Amount</h3>
              <div className="stat-value">₹{stats.totalAmount.toFixed(2)}</div>
              <p style={{ color: "#999", marginTop: "10px" }}>
                All transactions
              </p>
            </div>

            <div className="stat-card">
              <h3>Money Transfers</h3>
              <div className="stat-value">{stats.totalTransfers}</div>
              <p style={{ color: "#999", marginTop: "10px" }}>
                ₹{stats.transferAmount?.toFixed(2) || 0}
              </p>
            </div>

            <div className="stat-card">
              <h3>Mobile Recharges</h3>
              <div className="stat-value">{stats.totalRecharges}</div>
              <p style={{ color: "#999", marginTop: "10px" }}>
                ₹{stats.rechargeAmount?.toFixed(2) || 0}
              </p>
            </div>
          </div>

          {/* Recent Transactions */}
          <div style={{ maxWidth: "800px", margin: "40px auto" }}>
            <h3 style={{ color: "white", marginBottom: "20px" }}>
              📋 Recent Transactions
            </h3>

            {stats.recentTransactions.length === 0 ? (
              <p style={{ textAlign: "center", color: "white" }}>
                No transactions yet
              </p>
            ) : (
              <div>
                {stats.recentTransactions.map((t) => (
                  <div key={t.id} className="transaction-card">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <span
                          className={`transaction-badge ${t.type === "Recharge" ? "badge-recharge" : "badge-send"}`}
                        >
                          {t.type === "Recharge" ? "📲" : "💸"} {t.type}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: "1.2rem",
                          fontWeight: "bold",
                          color: "#667eea",
                        }}
                      >
                        ₹{t.amount}
                      </div>
                    </div>
                    <p style={{ marginTop: "10px", color: "#666" }}>
                      Mobile: <b>{t.mobile}</b>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Stats Summary */}
          {stats.totalTransactions > 0 && (
            <div
              style={{
                maxWidth: "800px",
                margin: "40px auto",
                background: "white",
                padding: "30px",
                borderRadius: "15px",
                textAlign: "center",
              }}
            >
              <h3 style={{ color: "#667eea", marginBottom: "20px" }}>
                📈 Summary
              </h3>
              <p
                style={{
                  color: "#666",
                  fontSize: "1.1rem",
                  marginBottom: "15px",
                }}
              >
                You have completed <b>{stats.totalTransactions}</b> transactions
              </p>
              <p
                style={{
                  color: "#666",
                  fontSize: "1.1rem",
                  marginBottom: "15px",
                }}
              >
                Total amount handled:{" "}
                <b style={{ color: "#667eea" }}>
                  ₹{stats.totalAmount.toFixed(2)}
                </b>
              </p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-around",
                  marginTop: "20px",
                  paddingTop: "20px",
                  borderTop: "1px solid #eee",
                }}
              >
                <div>
                  <p style={{ color: "#999", fontSize: "0.9rem" }}>Transfers</p>
                  <p
                    style={{
                      color: "#1565c0",
                      fontSize: "1.5rem",
                      fontWeight: "bold",
                    }}
                  >
                    {stats.totalTransfers}
                  </p>
                </div>
                <div>
                  <p style={{ color: "#999", fontSize: "0.9rem" }}>Recharges</p>
                  <p
                    style={{
                      color: "#2e7d32",
                      fontSize: "1.5rem",
                      fontWeight: "bold",
                    }}
                  >
                    {stats.totalRecharges}
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Dashboard;
