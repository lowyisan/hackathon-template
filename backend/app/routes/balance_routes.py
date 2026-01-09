from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from ..utils.auth_helpers import get_current_user
from ..services.balance_service import get_company_balance

balance_bp = Blueprint("balance", __name__)

@balance_bp.get("/balances")
@jwt_required()
def balances():
    """
    Returns the Carbon and Cash balances for the authenticated user's company.
    """
    user = get_current_user()
    bal = get_company_balance(user.company_id)

    return jsonify({
        "companyId": user.company_id,
        "carbonBalance": bal.carbon_balance,
        "cashBalance": bal.cash_balance
    })
