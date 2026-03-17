import { useEffect, useState } from "react";
import API from "../api";
import { useAuth } from "../hooks/useAuth";
import Icon from "../components/Icon";
import { formatCurrency, formatDate } from "../utils/formatters";

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalAmount: 0,
    totalRecharges: 0,
    totalTransfers: 0,
    rechargeAmount: 0,
    transferAmount: 0,
    recentTransactions: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const statCards = [
    {
      key: "transactions",
      title: "Total Transactions",
      value: stats.totalTransactions,
      description: "Total count",
      icon: "history",
      variant: "transactions",
    },
    {
      key: "amount",
      title: "Total Amount",
      value: formatCurrency(stats.totalAmount),
      description: "All transactions",
      icon: "coins",
      variant: "amount",
    },
    {
      key: "transfers",
      title: "Money Transfers",
      value: stats.totalTransfers,
      description: formatCurrency(stats.transferAmount),
      icon: "send",
      variant: "transfers",
    },
    {
      key: "recharges",
      title: "Mobile Recharges",
      value: stats.totalRecharges,
      description: formatCurrency(stats.rechargeAmount),
      icon: "bolt",
      variant: "recharges",
    },
  ];

  useEffect(() => {
    let isActive = true;

    async function loadStats() {
      setLoading(true);

      try {
        const response = await API.get("/transactions");
        const data = Array.isArray(response.data) ? response.data : [];

        const recharges = data.filter((item) => item.type === "Recharge");
        const transfers = data.filter((item) => item.type === "Send Money");

        const rechargeAmount = recharges.reduce(
          (sum, item) => sum + Number.parseFloat(item.amount || 0),
          0,
        );
        const transferAmount = transfers.reduce(
          (sum, item) => sum + Number.parseFloat(item.amount || 0),
          0,
        );

        if (!isActive) {
          return;
        }

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
      } catch (requestError) {
        console.error("Failed to load stats:", requestError);

        if (isActive) {
          setError("Unable to load dashboard data.");
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    loadStats();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <div className="page">
      <div className="dashboard-title-row">
        <Icon name="dashboard" className="dashboard-title-icon" />
        <h2>Dashboard and Analytics</h2>
      </div>

      <div className="balance-section">
        <div className="dashboard-balance-card">
          <div className="balance-card-content">
            <div className="balance-icon-badge">
              <Icon name="card" className="balance-card-icon" />
            </div>
            <div className="balance-header">
              <h3>Account Balance</h3>
              <p className="balance-subtext">Current wallet balance</p>
            </div>
          </div>
          <div className="balance-display">
            {formatCurrency(user?.balance || 0)}
          </div>
        </div>
      </div>

      {error && <div className="error">{error}</div>}
      {loading && <div className="spinner"></div>}

      {!loading && (
        <>
          <div className="dashboard-stats">
            {statCards.map((card) => (
              <div
                key={card.key}
                className={`stat-card stat-card-${card.variant}`}
              >
                <div className="stat-card-header">
                  <div>
                    <h3>{card.title}</h3>
                  </div>
                  <span className="stat-card-icon-wrap">
                    <Icon name={card.icon} className="stat-card-icon" />
                  </span>
                </div>
                <div className="stat-value">{card.value}</div>
                <p className="stat-description">{card.description}</p>
              </div>
            ))}
          </div>

          <div style={{ maxWidth: "800px", margin: "40px auto" }}>
            <div className="dashboard-section-title">
              <Icon name="history" className="dashboard-section-icon" />
              <h3>Recent Transactions</h3>
            </div>

            {stats.recentTransactions.length === 0 ? (
              <p style={{ textAlign: "center", color: "white" }}>
                No transactions yet
              </p>
            ) : (
              <div>
                {stats.recentTransactions.map((transaction) => (
                  <div
                    key={`${transaction.type}-${transaction.id}`}
                    className="transaction-card"
                  >
                    <div
                      className="recent-transaction-row"
                    >
                      <div className="recent-transaction-details">
                        <div className="recent-transaction-label">
                          <span className="recent-transaction-icon">
                            <Icon
                              name={
                                transaction.type === "Recharge"
                                  ? "recharge"
                                  : "send"
                              }
                              className="recent-transaction-type-icon"
                            />
                          </span>
                          <span
                            className={`transaction-badge ${transaction.type === "Recharge" ? "badge-recharge" : "badge-send"}`}
                          >
                            {transaction.type}
                          </span>
                        </div>
                        <p style={{ marginTop: "10px", color: "#666" }}>
                          Mobile: <b>{transaction.mobile}</b>
                        </p>
                        <p style={{ marginTop: "6px", color: "#888" }}>
                          Paid via <b>{transaction.payment_method || "Wallet"}</b>
                        </p>
                      </div>
                      <div className="recent-transaction-amount">
                        <div>{formatCurrency(transaction.amount)}</div>
                        <div style={{ fontSize: "0.9rem", color: "#999" }}>
                          {formatDate(transaction.created_at)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;
