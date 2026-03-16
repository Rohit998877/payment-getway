import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
// import { useAuth } from "../hooks/useAuth";
import Toast from "../components/Toast";
import "../styles/add-money.css";

function AddMoney() {
  const { user, token, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    amount: "",
  });

  if (!token) {
    navigate("/");
    return null;
  }

  const quickAmounts = [100, 500, 1000, 2000, 5000, 10000];

  const handleQuickAmount = (amount) => {
    setForm({ amount: amount.toString() });
    setErrors({});
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    setForm({ amount: value });
    if (errors.amount) {
      setErrors({ ...errors, amount: "" });
    }
  };

  const handleAddMoney = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!form.amount.trim()) {
      newErrors.amount = "Amount is required";
    } else {
      const amount = parseInt(form.amount);
      if (isNaN(amount) || amount <= 0) {
        newErrors.amount = "Amount must be a positive number";
      } else if (amount > 100000) {
        newErrors.amount = "Maximum limit is ₹100,000";
      } else if (amount < 10) {
        newErrors.amount = "Minimum amount is ₹10";
      }
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      const res = await API.post(
        "/add-money",
        { amount: parseInt(form.amount) },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.data.user) {
        updateUser(res.data.user);
        setToast({
          message: `✓ ₹${form.amount} added to your account successfully!`,
          type: "success",
        });
        setForm({ amount: "" });
        setTimeout(() => {
          navigate("/profile");
        }, 2000);
      }
    } catch (err) {
      setToast({
        message: err.response?.data?.error || "Failed to add money",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h2>💰 Add Money to Wallet</h2>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="add-money-container">
        <div className="add-money-card">
          {/* Current Balance */}
          <div className="current-balance">
            <p className="balance-label">Current Balance</p>
            <div className="balance-display">
              ₹{user?.balance?.toFixed(2) || "0.00"}
            </div>
          </div>

          {/* Quick Amount Selection */}
          <div className="quick-amounts">
            <p className="quick-label">📱 Quick Select</p>
            <div className="quick-buttons">
              {quickAmounts.map((amount) => (
                <button
                  key={amount}
                  className={`quick-btn ${form.amount === amount.toString() ? "active" : ""}`}
                  onClick={() => handleQuickAmount(amount)}
                >
                  ₹{amount}
                </button>
              ))}
            </div>
          </div>

          {/* Amount Form */}
          <form onSubmit={handleAddMoney}>
            <div className="form-group">
              <label htmlFor="amount">Enter Amount (₹)</label>
              <input
                type="number"
                id="amount"
                placeholder="Enter amount"
                value={form.amount}
                onChange={handleAmountChange}
                min="10"
                max="100000"
                step="1"
                style={{
                  borderColor: errors.amount ? "#f44336" : "#e0e0e0",
                }}
              />
              {errors.amount && <p className="error-text">✗ {errors.amount}</p>}
            </div>

            {/* Amount Info */}
            {form.amount && !errors.amount && (
              <div className="amount-info">
                <div className="info-row">
                  <span>Amount</span>
                  <span className="amount-value">
                    ₹{parseInt(form.amount).toFixed(2)}
                  </span>
                </div>
                <div className="info-row">
                  <span>Fee</span>
                  <span className="fee-value">FREE</span>
                </div>
                <div className="info-row total">
                  <span>Total Amount</span>
                  <span className="final-amount">
                    ₹{parseInt(form.amount).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="add-money-btn"
              disabled={loading || !form.amount}
            >
              {loading ? "Processing..." : "Add Money Now"}
            </button>
          </form>

          {/* Info Box */}
          <div className="info-box">
            <p className="info-icon">ℹ️</p>
            <ul className="info-list">
              <li>Minimum amount: ₹10</li>
              <li>Maximum amount: ₹100,000</li>
              <li>Amount will be added instantly</li>
              <li>No charges or hidden fees</li>
            </ul>
          </div>
        </div>

        {/* Balance Updates Info */}
        <div className="info-card">
          <h3>🎯 How it Works</h3>
          <ol>
            <li>Select or enter the amount you want to add</li>
            <li>Click "Add Money Now" button</li>
            <li>Your balance will be updated instantly</li>
            <li>Transaction will be saved in your history</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default AddMoney;
