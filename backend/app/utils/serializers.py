def serialize_request(r):
    """
    Transforms an OutstandingRequest database object into a dictionary.
    
    This serves as a Data Transfer Object (DTO) for API responses, ensuring
    dates are formatted correctly (ISO format) and keys are camelCased for the frontend.
    """
    return {
        "id": r.id,
        "requestDate": r.request_date.isoformat(),
        "requestType": r.request_type,
        "carbonUnitPrice": r.carbon_unit_price,
        "carbonQuantity": r.carbon_quantity,
        "requestReason": r.request_reason,
        "status": r.status,
        "requestorCompanyId": r.requestor_company_id,
        "targetCompanyId": r.target_company_id
    }
