from ..extensions import db

class User(db.Model):
    """
    Represents an individual user of the platform.
    
    Users are employees/agents of a specific 'Company'.
    All actions taken by a User (like creating requests) are attributed to their linked Company.
    """
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    company_id = db.Column(db.Integer, db.ForeignKey("company.id"), nullable=False)