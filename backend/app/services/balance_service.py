from ..models.company import CompanyAccountBalance

def get_company_balance(company_id):
    """
    Helper function to retrieve the account balance record for a specific company.
    
    This acts as a safe lookup method that ensures the balance record exists
    before returning it, preventing NoneType errors in business logic.
    
    Args:
        company_id (int): The ID of the company.
        
    Returns:
        CompanyAccountBalance: The balance record.
        
    Raises:
        ValueError: If no balance record exists for the given company_id.
    """
    balance = CompanyAccountBalance.query.filter_by(
        company_id=company_id
    ).first()

    if not balance:
        raise ValueError("Company balance not found")

    return balance
