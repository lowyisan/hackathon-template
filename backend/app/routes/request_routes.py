from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from ..models.request import OutstandingRequest, RequestReceived
from ..utils.auth_helpers import get_current_user
from ..utils.serializers import serialize_request
from ..services.request_service import accept_request_logic
from ..extensions import db

request_bp = Blueprint("requests", __name__)

@request_bp.get("/requests")
@jwt_required()
def my_requests():
    """
    Lists all trade requests created by the current user's company (Outgoing).
    """
    user = get_current_user()
    reqs = OutstandingRequest.query.filter_by(
        requestor_company_id=user.company_id
    ).all()
    return jsonify([serialize_request(r) for r in reqs])

@request_bp.get("/requests-received")
@jwt_required()
def requests_received():
    """
    Lists all PENDING trade requests targeting the current user's company (Incoming).
    """
    user = get_current_user()
    reqs = OutstandingRequest.query.filter_by(
        target_company_id=user.company_id,
        status="PENDING"
    ).all()
    return jsonify([serialize_request(r) for r in reqs])

@request_bp.post("/requests")
@jwt_required()
def create_request():
    """
    Creates a new trade proposal (OutstandingRequest).
    
    Also creates a corresponding 'RequestReceived' record for the target company's inbox.
    """
    user = get_current_user()
    data = request.get_json()

    r = OutstandingRequest(
        requestor_company_id=user.company_id,
        target_company_id=data["targetCompanyId"],
        request_type=data["requestType"],
        carbon_unit_price=data["carbonUnitPrice"],
        carbon_quantity=data["carbonQuantity"],
        request_reason=data["requestReason"]
    )

    db.session.add(r)
    db.session.commit()

    rr = RequestReceived(outstanding_request_id=r.id)
    db.session.add(rr)
    db.session.commit()

    return jsonify(serialize_request(r)), 201

@request_bp.put("/requests/<int:req_id>")
@jwt_required()
def update_request(req_id):
    """
    Updates details of an existing pending request created by the user's company.
    """
    user = get_current_user()
    r = OutstandingRequest.query.get_or_404(req_id)

    if r.requestor_company_id != user.company_id:
        return jsonify({"msg": "Unauthorized"}), 403

    if r.status != "PENDING":
        return jsonify({"msg": "Cannot edit non-pending request"}), 400

    data = request.get_json()
    r.target_company_id = data.get("targetCompanyId", r.target_company_id)
    r.request_type = data.get("requestType", r.request_type)
    r.carbon_unit_price = data.get("carbonUnitPrice", r.carbon_unit_price)
    r.carbon_quantity = data.get("carbonQuantity", r.carbon_quantity)
    r.request_reason = data.get("requestReason", r.request_reason)

    db.session.commit()
    return jsonify(serialize_request(r))

@request_bp.delete("/requests/<int:req_id>")
@jwt_required()
def delete_request(req_id):
    """
    Cancels (deletes) a pending request created by the user's company.
    """
    user = get_current_user()
    r = OutstandingRequest.query.get_or_404(req_id)

    if r.requestor_company_id != user.company_id:
        return jsonify({"msg": "Unauthorized"}), 403

    if r.status != "PENDING":
        return jsonify({"msg": "Cannot delete non-pending request"}), 400

    # Also delete from RequestReceived if it exists
    rr = RequestReceived.query.filter_by(outstanding_request_id=r.id).first()
    if rr:
        db.session.delete(rr)

    db.session.delete(r)
    db.session.commit()
    return "", 204

@request_bp.post("/requests-received/<int:req_id>/decision")
@jwt_required()
def decide(req_id):
    """
    Accepts or Rejects an incoming trade request.
    
    - REJECT: Simply marks status as REJECTED.
    - ACCEPT: Triggers asset transfer logic (see accept_request_logic).
    """
    data = request.get_json()
    r = OutstandingRequest.query.get_or_404(req_id)

    if r.status != "PENDING":
        return jsonify({"msg": "Request already processed"}), 400

    if data["decision"] == "REJECT":
        r.status = "REJECTED"
        db.session.commit()
        return jsonify({"status": "REJECTED"})

    try:
        accept_request_logic(r)
    except ValueError as e:
        return jsonify({"msg": str(e)}), 422

    return jsonify({"status": "ACCEPTED"})
