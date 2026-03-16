import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
// import { useAuth } from "../hooks/useAuth";
import Toast from "../components/Toast";
import "../styles/profile.css";

function Profile() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    created_at: "",
    balance: 0,
  });

  const [stats, setStats] = useState({
    send_transactions: 0,
    recharge_transactions: 0,
    total_sent: 0,
    total_recharged: 0,
  });

  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    fetchProfile();
  }, [token, navigate]);

  const fetchProfile = async () => {
    try {
      const res = await API.get("/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.user) {
        setProfile(res.data.user);
        setEditForm({
          name: res.data.user.name,
          phone: res.data.user.phone,
        });
      }

      if (res.data.stats) {
        setStats(res.data.stats);
      }
    } catch (err) {
      setToast({ message: "Failed to load profile", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    const newErrors = {};

    if (!editForm.name.trim()) {
      newErrors.name = "Name is required";
    } else if (editForm.name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }

    if (editForm.phone && !/^[0-9]{10}$/.test(editForm.phone)) {
      newErrors.phone = "Phone must be 10 digits";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      await API.put("/profile", editForm, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProfile({ ...profile, ...editForm });
      setEditing(false);
      setToast({ message: "Profile updated successfully", type: "success" });
    } catch (err) {
      setToast({
        message: err.response?.data?.error || "Failed to update profile",
        type: "error",
      });
    }
  };

  const handleChangePassword = async () => {
    const newErrors = {};

    if (!passwordForm.old_password) {
      newErrors.old_password = "Current password is required";
    }

    if (!passwordForm.new_password) {
      newErrors.new_password = "New password is required";
    } else if (passwordForm.new_password.length < 6) {
      newErrors.new_password = "Password must be at least 6 characters";
    }

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      await API.post(
        "/change-password",
        {
          old_password: passwordForm.old_password,
          new_password: passwordForm.new_password,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setPasswordForm({
        old_password: "",
        new_password: "",
        confirm_password: "",
      });
      setShowPasswordForm(false);
      setToast({ message: "Password changed successfully", type: "success" });
    } catch (err) {
      setToast({
        message: err.response?.data?.error || "Failed to change password",
        type: "error",
      });
    }
  };

  const handleLogout = () => {
    logout();
    setToast({ message: "Logged out successfully", type: "success" });
    setTimeout(() => {
      navigate("/");
    }, 1500);
  };

  if (loading) {
    return (
      <div className="page">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="page">
      <h2>👤 My Profile</h2>

      <div className="profile-container">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar">
            {profile.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="profile-info-header">
            <h3>{profile.name}</h3>
            <p>{profile.email}</p>
            <p className="member-since">
              Member since {new Date(profile.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="balance-card">
            <p className="balance-label">💰 Account Balance</p>
            <div className="balance-amount">
              ₹{profile.balance?.toFixed(2) || "0.00"}
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>

        {/* Statistics */}
        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>Money Transferred</h3>
            <div className="stat-value">₹{stats.total_sent.toFixed(2)}</div>
            <p style={{ color: "#999", marginTop: "10px" }}>
              {stats.send_transactions} transactions
            </p>
          </div>

          <div className="stat-card">
            <h3>Recharges Done</h3>
            <div className="stat-value">
              ₹{stats.total_recharged.toFixed(2)}
            </div>
            <p style={{ color: "#999", marginTop: "10px" }}>
              {stats.recharge_transactions} transactions
            </p>
          </div>

          <div className="stat-card">
            <h3>Total Activity</h3>
            <div className="stat-value">
              {stats.send_transactions + stats.recharge_transactions}
            </div>
            <p style={{ color: "#999", marginTop: "10px" }}>All transactions</p>
          </div>
        </div>

        {/* Edit Profile Section */}
        <div className="profile-section">
          <div className="section-header">
            <h3>📝 Account Details</h3>
            {!editing && (
              <button className="edit-btn" onClick={() => setEditing(true)}>
                Edit Profile
              </button>
            )}
          </div>

          {editing ? (
            <div className="edit-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => {
                    setEditForm({ ...editForm, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: "" });
                  }}
                  style={{ borderColor: errors.name ? "#f44336" : "#e0e0e0" }}
                />
                {errors.name && <p className="error-text">✗ {errors.name}</p>}
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => {
                    setEditForm({ ...editForm, phone: e.target.value });
                    if (errors.phone) setErrors({ ...errors, phone: "" });
                  }}
                  maxLength="10"
                  placeholder="10-digit number"
                  style={{ borderColor: errors.phone ? "#f44336" : "#e0e0e0" }}
                />
                {errors.phone && <p className="error-text">✗ {errors.phone}</p>}
              </div>

              <div className="form-actions">
                <button className="save-btn" onClick={handleUpdateProfile}>
                  Save Changes
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => {
                    setEditing(false);
                    setEditForm({
                      name: profile.name,
                      phone: profile.phone,
                    });
                    setErrors({});
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="profile-details">
              <div className="detail-item">
                <span className="detail-label">📧 Email</span>
                <span className="detail-value">{profile.email}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">📱 Phone</span>
                <span className="detail-value">
                  {profile.phone || "Not provided"}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">📅 Joined</span>
                <span className="detail-value">
                  {new Date(profile.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Change Password Section */}
        <div className="profile-section">
          <div className="section-header">
            <h3>🔒 Security</h3>
            {!showPasswordForm && (
              <button
                className="edit-btn"
                onClick={() => setShowPasswordForm(true)}
              >
                Change Password
              </button>
            )}
          </div>

          {showPasswordForm && (
            <div className="edit-form">
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  value={passwordForm.old_password}
                  onChange={(e) => {
                    setPasswordForm({
                      ...passwordForm,
                      old_password: e.target.value,
                    });
                    if (errors.old_password)
                      setErrors({ ...errors, old_password: "" });
                  }}
                  placeholder="Enter current password"
                  style={{
                    borderColor: errors.old_password ? "#f44336" : "#e0e0e0",
                  }}
                />
                {errors.old_password && (
                  <p className="error-text">✗ {errors.old_password}</p>
                )}
              </div>

              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={passwordForm.new_password}
                  onChange={(e) => {
                    setPasswordForm({
                      ...passwordForm,
                      new_password: e.target.value,
                    });
                    if (errors.new_password)
                      setErrors({ ...errors, new_password: "" });
                  }}
                  placeholder="Enter new password"
                  style={{
                    borderColor: errors.new_password ? "#f44336" : "#e0e0e0",
                  }}
                />
                {errors.new_password && (
                  <p className="error-text">✗ {errors.new_password}</p>
                )}
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  value={passwordForm.confirm_password}
                  onChange={(e) => {
                    setPasswordForm({
                      ...passwordForm,
                      confirm_password: e.target.value,
                    });
                    if (errors.confirm_password)
                      setErrors({ ...errors, confirm_password: "" });
                  }}
                  placeholder="Confirm new password"
                  style={{
                    borderColor: errors.confirm_password
                      ? "#f44336"
                      : "#e0e0e0",
                  }}
                />
                {errors.confirm_password && (
                  <p className="error-text">✗ {errors.confirm_password}</p>
                )}
              </div>

              <div className="form-actions">
                <button className="save-btn" onClick={handleChangePassword}>
                  Update Password
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordForm({
                      old_password: "",
                      new_password: "",
                      confirm_password: "",
                    });
                    setErrors({});
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default Profile;
