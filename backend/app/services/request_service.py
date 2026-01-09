from ..extensions import db
from .balance_service import get_company_balance

def accept_request_logic(request_obj):
    """
    Executes the trade defined in the request object.
    
    This function performs an atomic transaction:
    1. Retrieves current balances for both parties.
    2. Validates solvency (Buyer has Cash, Seller has Carbon).
    3. Transfers assets:
       - 'BUY': Requestor pays Cash, receives Carbon. Target gives Carbon, receives Cash.
       - 'SELL': Requestor gives Carbon, receives Cash. Target pays Cash, receives Carbon.
    4. Updates request status to ACCEPTED.
    
    Raises:
        ValueError: If the selling party lacks Carbon or the buying party lacks Cash.
    """
    requestor = get_company_balance(request_obj.requestor_company_id)
    target = get_company_balance(request_obj.target_company_id)

    total_price = request_obj.carbon_unit_price * request_obj.carbon_quantity

    if request_obj.request_type == "BUY":
        if target.carbon_balance < request_obj.carbon_quantity:
            raise ValueError("Insufficient carbon")
        if requestor.cash_balance < total_price:
            raise ValueError("Insufficient cash")

        target.carbon_balance -= request_obj.carbon_quantity
        requestor.carbon_balance += request_obj.carbon_quantity
        requestor.cash_balance -= total_price
        target.cash_balance += total_price

    else:
        if requestor.carbon_balance < request_obj.carbon_quantity:
            raise ValueError("Insufficient carbon")
        if target.cash_balance < total_price:
            raise ValueError("Insufficient cash")

        requestor.carbon_balance -= request_obj.carbon_quantity
        target.carbon_balance += request_obj.carbon_quantity
        target.cash_balance -= total_price
        requestor.cash_balance += total_price

    request_obj.status = "ACCEPTED"
    db.session.commit()
