from ..extensions import db

class Company(db.Model):
    """
    Represents the identity of a trading entity (Company) in the system.
    This model serves as the parent record for users and account balances.
    """
    id = db.Column(db.Integer, primary_key=True)
    company_name = db.Column(db.String(120), unique=True, nullable=False)

class CompanyAccountBalance(db.Model):
    """
    Stores the financial and asset state of a Company.
    Separated from the Company model to isolate mutable balance data (Cash and Carbon)
    from immutable identity data.
    """
    id = db.Column(db.Integer, primary_key=True)
    company_id = db.Column(db.Integer, db.ForeignKey("company.id"), unique=True)
    carbon_balance = db.Column(db.Float, default=0)
    cash_balance = db.Column(db.Float, default=0)
