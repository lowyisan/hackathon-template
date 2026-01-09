from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from datetime import datetime, timedelta
from ..utils.auth_helpers import get_current_user
from ..models.request import OutstandingRequest

alert_bp = Blueprint("alerts", __name__)

@alert_bp.get("/alerts")
@jwt_required()
def alerts():
    """
    Returns a list of IDs for pending requests that are older than 7 days (Overdue).
    """
    user = get_current_user()
    from datetime import timezone
    cutoff = datetime.now(timezone.utc) - timedelta(days=7)

    overdue = OutstandingRequest.query.filter(
        OutstandingRequest.target_company_id == user.company_id,
        OutstandingRequest.status == "PENDING",
        OutstandingRequest.request_date <= cutoff
    ).all()

    return jsonify([r.id for r in overdue])
