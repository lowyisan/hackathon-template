from ..extensions import db
from datetime import datetime

class OutstandingRequest(db.Model):
    """
    Represents the terms of a proposed trade (the 'Deal').
    
    Contains all the details required to execute a trade:
    - Who is asking (requestor) vs Who is being asked (target)
    - What kind of trade (BUY vs SELL)
    - The price and quantity
    
    The 'status' field tracks the lifecycle: PENDING -> ACCEPTED / REJECTED.
    """
    id = db.Column(db.Integer, primary_key=True)
    request_date = db.Column(db.DateTime, default=datetime.utcnow)

    requestor_company_id = db.Column(db.Integer, nullable=False)
    target_company_id = db.Column(db.Integer, nullable=False)

    request_type = db.Column(db.String(10), nullable=False)
    carbon_unit_price = db.Column(db.Float, nullable=False)
    carbon_quantity = db.Column(db.Float, nullable=False)
    request_reason = db.Column(db.String(255), nullable=False)

    status = db.Column(db.String(20), default="PENDING")

class RequestReceived(db.Model):
    """
    Represents an item in the target company's 'Inbox'.
    
    This links to an OutstandingRequest and adds receiver-specific metadata,
    such as whether the alert has been viewed or is overdue.
    This allows the system to efficiently query 'What requests are waiting for ME?'.
    """
    id = db.Column(db.Integer, primary_key=True)
    outstanding_request_id = db.Column(db.Integer, unique=True)
    is_overdue_alert = db.Column(db.Boolean, default=False)
    is_alert_viewed = db.Column(db.Boolean, default=False)
