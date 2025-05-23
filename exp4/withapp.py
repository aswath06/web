# with backend:
# pip install flask flask_sqlalchemy flask_jwt_extended flask_bcrypt flask-cors mysql-connector-python flask-mysql pymysql

from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://root:A09.10.2005@localhost/banking_db'
app.config['JWT_SECRET_KEY'] = os.urandom(24).hex()
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db, bcrypt, jwt = SQLAlchemy(app), Bcrypt(app), JWTManager(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)
    balance = db.Column(db.Float, default=1000.0)

class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)

with app.app_context():
    db.create_all()  # This will create tables in MySQL
    User.query.filter(User.balance.is_(None)).update({User.balance: 1000.0}, synchronize_session=False)
    db.session.commit()

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if User.query.filter_by(username=data['username']).first():
        return jsonify({"message": "User already exists"}), 400
    new_user = User(username=data['username'], password=bcrypt.generate_password_hash(data['password']).decode('utf-8'))
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User registered successfully"}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data['username']).first()
    if user and bcrypt.check_password_hash(user.password, data['password']):
        return jsonify({"token": create_access_token(identity=str(user.id))}), 200
    return jsonify({"message": "Invalid credentials"}), 401

@app.route('/balance', methods=['GET'])
@jwt_required()
def get_balance():
    user = User.query.get(get_jwt_identity())
    return jsonify({"balance": user.balance if user else "User not found"}), 200 if user else 404

@app.route('/transfer', methods=['POST'])
@jwt_required()
def transfer():
    data, sender = request.get_json(), User.query.get(get_jwt_identity())
    receiver = User.query.filter_by(username=data['receiver']).first()
    if not receiver or sender.balance < float(data['amount']):
        return jsonify({"message": "Transfer failed"}), 400
    sender.balance -= float(data['amount'])
    receiver.balance += float(data['amount'])
    db.session.add(Transaction(sender_id=sender.id, receiver_id=receiver.id, amount=float(data['amount'])))
    db.session.commit()
    return jsonify({"message": "Transfer successful"}), 200

if __name__ == '__main__':
    app.run(debug=True)
