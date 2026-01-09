from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from werkzeug.security import check_password_hash, generate_password_hash
from ..models.user import User
from ..models.company import Company, CompanyAccountBalance
from ..extensions import db
import re

auth_bp = Blueprint("auth", __name__)

def validate_password(password):
    """
    Validates password strength.
    Requires: Min 8 chars, at least 1 letter, at least 1 number.
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    if not re.search(r"[a-zA-Z]", password):
        return False, "Password must contain at least one letter"
    if not re.search(r"\d", password):
        return False, "Password must contain at least one number"
    return True, ""

@auth_bp.post("/register")
def register():
    """
    Registers a new user and creates their company.
    
    Expects JSON payload with:
    - 'email'
    - 'password'
    - 'companyName'
    
    Performs:
    1. Checks if email or company already exists.
    2. Validates password strength.
    3. Creates a new Company.
    4. Initializes CompanyAccountBalance.
    5. Creates a new User linked to this company.
    6. Returns an access_token.
    """
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")
    company_name = data.get("companyName")

    if not email or not password or not company_name:
        return jsonify({"msg": "Missing fields"}), 422

    # Password Validation
    is_valid, error_msg = validate_password(password)
    if not is_valid:
        return jsonify({"msg": error_msg}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"msg": "Email taken"}), 409
        
    if Company.query.filter_by(company_name=company_name).first():
        return jsonify({"msg": "Company name taken"}), 409

    # 1. Create Company
    new_company = Company(company_name=company_name)
    db.session.add(new_company)
    db.session.commit() # Commit to get ID

    # 2. Create Balance
    new_balance = CompanyAccountBalance(
        company_id=new_company.id,
        carbon_balance=100.0, # Default starting amount
        cash_balance=100.0    # Default starting amount
    )
    db.session.add(new_balance)

    # 3. Create User
    new_user = User(
        email=email,
        password_hash=generate_password_hash(password),
        company_id=new_company.id
    )
    db.session.add(new_user)
    
    db.session.commit()

    token = create_access_token(identity=str(new_user.id))
    return jsonify({"access_token": token}), 201

@auth_bp.post("/login")
def login():
    """
    Authenticates a user and returns a JWT access token.
    
    Expects JSON payload with 'email' and 'password'.
    Verifies credentials against the database hash.
    If successful, returns an access_token valid for subsequent requests.
    """
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"msg": "missing credentials"}), 422

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"msg": "invalid credentials"}), 401

    token = create_access_token(identity=str(user.id))
    return jsonify({"access_token": token})
