import mysql.connector

db = mysql.connector.connect(
    host="gateway01.ap-southeast-1.prod.aws.tidbcloud.com",
    user="4SH4E9PNTGGfHry.root",
    password="11jBBKuhqgO0plgI",
    database="payment_system"
)
# pip install -r requirements.txt
cursor = db.cursor()