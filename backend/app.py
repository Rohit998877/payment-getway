from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import os
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from datetime import datetime, timedelta

load_dotenv()

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000","https://paymentappindia.netlify.app",
    "https://69b7009ac7ca6e2b3e4cf3bf--paymentappindia.netlify.app"])

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this")

db = None
cursor = None

def init_db():
    global db, cursor
    try:
        db = mysql.connector.connect(
            host=os.getenv("DB_HOST", "localhost"),
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASSWORD", "Rohit@789"),
            database=os.getenv("DB_NAME", "payment_system")
        )
        cursor = db.cursor()
        
        # Create users table if it doesn't exist
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                phone VARCHAR(10),
                balance INT DEFAULT 5000,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        db.commit()
        
        # Create add_money (wallet recharge) table if it doesn't exist
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS add_money (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT NOT NULL,
                amount INT NOT NULL,
                status VARCHAR(50) DEFAULT 'Success',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)
        db.commit()
        
        print("OK - Database connected successfully")
        print("OK - Users table created/verified")
        return True
    except mysql.connector.Error as err:
        print(f"ERROR - Database connection error: {err}")
        db = None
        cursor = None
        return False

init_db()

@app.route("/")
def home():
    return jsonify({"message":"Backend Running"})

# Authentication Routes
@app.route("/register", methods=["POST"])
def register():
    try:
        if not db or not cursor:
            return jsonify({"error": "Database connection failed"}), 500
        
        data = request.json
        
        if not data or "name" not in data or "email" not in data or "password" not in data:
            return jsonify({"error": "Missing required fields"}), 400
        
        name = data["name"].strip()
        email = data["email"].strip().lower()
        password = data["password"]
        phone = data.get("phone", "").strip()
        
        # Validate inputs
        if len(name) < 3:
            return jsonify({"error": "Name must be at least 3 characters"}), 400
        if len(password) < 6:
            return jsonify({"error": "Password must be at least 6 characters"}), 400
        if "@" not in email:
            return jsonify({"error": "Invalid email format"}), 400
        
        # Check if user exists
        cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
        if cursor.fetchone():
            return jsonify({"error": "Email already registered"}), 400
        
        # Hash password
        hashed_password = generate_password_hash(password)
        
        # Insert user with default balance of 5000
        sql = "INSERT INTO users(name, email, password, phone, balance, created_at) VALUES(%s, %s, %s, %s, %s, %s)"
        cursor.execute(sql, (name, email, hashed_password, phone, 5000, datetime.now()))
        db.commit()
        
        return jsonify({"message": "Account created successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/login", methods=["POST"])
def login():
    try:
        if not db or not cursor:
            return jsonify({"error": "Database connection failed"}), 500
        
        data = request.json
        
        if not data or "email" not in data or "password" not in data:
            return jsonify({"error": "Missing email or password"}), 400
        
        email = data["email"].strip().lower()
        password = data["password"]
        
        # Check user
        cursor.execute("SELECT id, name, email, phone, password, balance FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        
        if not user or not check_password_hash(user[4], password):
            return jsonify({"error": "Invalid email or password"}), 401
        
        # Generate JWT token
        token = jwt.encode({
            "user_id": user[0],
            "email": user[2],
            "exp": datetime.utcnow() + timedelta(days=7)
        }, SECRET_KEY, algorithm="HS256")
        
        return jsonify({
            "message": "Login successful",
            "token": token,
            "user": {
                "id": user[0],
                "name": user[1],
                "email": user[2],
                "phone": user[3],
                "balance": user[5]
            }
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/profile", methods=["GET"])
def get_profile():
    try:
        if not db or not cursor:
            return jsonify({"error": "Database connection failed"}), 500
        
        # Get token from header
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing authentication token"}), 401
        
        token = auth_header[7:]
        
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            user_id = payload["user_id"]
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid or expired token"}), 401
        
        # Get user details
        cursor.execute("SELECT id, name, email, phone, created_at, balance FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Get user transaction stats
        cursor.execute("SELECT COUNT(*) FROM transactions WHERE sender = (SELECT phone FROM users WHERE id = %s)", (user_id,))
        send_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM recharge WHERE mobile = (SELECT phone FROM users WHERE id = %s)", (user_id,))
        recharge_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT SUM(amount) FROM transactions WHERE sender = (SELECT phone FROM users WHERE id = %s)", (user_id,))
        send_amount = cursor.fetchone()[0] or 0
        
        cursor.execute("SELECT SUM(amount) FROM recharge WHERE mobile = (SELECT phone FROM users WHERE id = %s)", (user_id,))
        recharge_amount = cursor.fetchone()[0] or 0
        
        return jsonify({
            "user": {
                "id": user[0],
                "name": user[1],
                "email": user[2],
                "phone": user[3],
                "created_at": str(user[4]),
                "balance": user[5]
            },
            "stats": {
                "send_transactions": send_count,
                "recharge_transactions": recharge_count,
                "total_sent": float(send_amount),
                "total_recharged": float(recharge_amount)
            }
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/profile", methods=["PUT"])
def update_profile():
    try:
        if not db or not cursor:
            return jsonify({"error": "Database connection failed"}), 500
        
        # Get token from header
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing authentication token"}), 401
        
        token = auth_header[7:]
        
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            user_id = payload["user_id"]
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid or expired token"}), 401
        
        data = request.json
        
        # Update allowed fields
        update_fields = []
        update_values = []
        
        if "name" in data and data["name"].strip():
            update_fields.append("name = %s")
            update_values.append(data["name"].strip())
        
        if "phone" in data and data["phone"].strip():
            update_fields.append("phone = %s")
            update_values.append(data["phone"].strip())
        
        if not update_fields:
            return jsonify({"error": "No fields to update"}), 400
        
        update_values.append(user_id)
        sql = f"UPDATE users SET {', '.join(update_fields)} WHERE id = %s"
        cursor.execute(sql, update_values)
        db.commit()
        
        return jsonify({"message": "Profile updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/change-password", methods=["POST"])
def change_password():
    try:
        if not db or not cursor:
            return jsonify({"error": "Database connection failed"}), 500
        
        # Get token from header
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing authentication token"}), 401
        
        token = auth_header[7:]
        
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            user_id = payload["user_id"]
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid or expired token"}), 401
        
        data = request.json
        
        if not data or "old_password" not in data or "new_password" not in data:
            return jsonify({"error": "Missing required fields"}), 400
        
        # Get user
        cursor.execute("SELECT password FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()
        
        if not user or not check_password_hash(user[0], data["old_password"]):
            return jsonify({"error": "Current password is incorrect"}), 401
        
        if len(data["new_password"]) < 6:
            return jsonify({"error": "New password must be at least 6 characters"}), 400
        
        # Update password
        hashed_password = generate_password_hash(data["new_password"])
        cursor.execute("UPDATE users SET password = %s WHERE id = %s", (hashed_password, user_id))
        db.commit()
        
        return jsonify({"message": "Password changed successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/send-money", methods=["POST"])
def send_money():
    try:
        if not db or not cursor:
            return jsonify({"error": "Database connection failed"}), 500
            
        data = request.json
        
        if not data or "mobile" not in data or "amount" not in data:
            return jsonify({"error": "Missing required fields"}), 400

        mobile = data["mobile"]
        amount = data["amount"]

        sql = "INSERT INTO transactions(sender,amount) VALUES(%s,%s)"

        cursor.execute(sql, (mobile, amount))
        db.commit()

        return jsonify({"message": "Payment Successful"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/transactions", methods=["GET"])
def transactions():
    try:
        if not db or not cursor:
            return jsonify({"error": "Database connection failed"}), 500
            
        data = []
        
        # Get recharge transactions
        cursor.execute("SELECT id, mobile, amount FROM recharge ORDER BY id DESC")
        recharge_rows = cursor.fetchall()
        for r in recharge_rows:
            data.append({
                "id": r[0],
                "mobile": r[1],
                "amount": r[2],
                "type": "Recharge"
            })
        
        # Get send money transactions
        cursor.execute("SELECT id, sender as mobile, amount FROM transactions ORDER BY id DESC")
        transaction_rows = cursor.fetchall()
        for r in transaction_rows:
            data.append({
                "id": r[0],
                "mobile": r[1],
                "amount": r[2],
                "type": "Send Money"
            })
        
        # Sort by id in descending order
        data.sort(key=lambda x: x["id"], reverse=True)

        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
@app.route("/recharge", methods=["POST"])
def recharge():
    try:
        if not db or not cursor:
            return jsonify({"error": "Database connection failed"}), 500
            
        data = request.json
        
        if not data or "mobile" not in data or "amount" not in data:
            return jsonify({"error": "Missing required fields"}), 400

        mobile = data["mobile"]
        amount = data["amount"]

        sql = "INSERT INTO recharge(mobile,amount) VALUES(%s,%s)"

        cursor.execute(sql, (mobile, amount))
        db.commit()

        return jsonify({"message": "Recharge Successful"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/add-money", methods=["POST"])
def add_money():
    try:
        if not db or not cursor:
            return jsonify({"error": "Database connection failed"}), 500
        
        # Get token from header
        token = request.headers.get("Authorization", "").split(" ")
        if len(token) != 2:
            return jsonify({"error": "Missing authorization token"}), 401
        
        try:
            decoded = jwt.decode(token[1], SECRET_KEY, algorithms=["HS256"])
            user_id = decoded["user_id"]
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid or expired token"}), 401
        
        data = request.json
        if not data or "amount" not in data:
            return jsonify({"error": "Missing amount"}), 400
        
        amount = int(data["amount"])
        
        if amount <= 0:
            return jsonify({"error": "Amount must be greater than 0"}), 400
        if amount > 100000:
            return jsonify({"error": "Maximum limit is ₹100,000"}), 400
        
        # Get current balance
        cursor.execute("SELECT balance FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Update balance
        new_balance = user[0] + amount
        cursor.execute("UPDATE users SET balance = %s WHERE id = %s", (new_balance, user_id))
        
        # Record transaction
        cursor.execute("INSERT INTO add_money(user_id, amount, status) VALUES(%s, %s, %s)", 
                      (user_id, amount, "Success"))
        db.commit()
        
        # Return updated user
        cursor.execute("SELECT id, name, email, phone, created_at, balance FROM users WHERE id = %s", (user_id,))
        updated_user = cursor.fetchone()
        
        return jsonify({
            "message": "Money added successfully",
            "user": {
                "id": updated_user[0],
                "name": updated_user[1],
                "email": updated_user[2],
                "phone": updated_user[3],
                "created_at": str(updated_user[4]),
                "balance": updated_user[5]
            }
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5000,debug=True)