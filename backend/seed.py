from werkzeug.security import generate_password_hash
from app import create_app
from app.extensions import db
from app.models.company import Company, CompanyAccountBalance
from app.models.user import User

app = create_app()

with app.app_context():
    db.drop_all()
    db.create_all()

    c1 = Company(company_name="Acme")
    c2 = Company(company_name="GreenWorks")

    db.session.add_all([c1, c2])
    db.session.commit()

    b1 = CompanyAccountBalance(company_id=c1.id, carbon_balance=1000, cash_balance=500000)
    b2 = CompanyAccountBalance(company_id=c2.id, carbon_balance=800, cash_balance=300000)

    u1 = User(email="admin@acme.com", password_hash=generate_password_hash("password123"), company_id=c1.id)
    u2 = User(email="admin@greenworks.com", password_hash=generate_password_hash("password123"), company_id=c2.id)

    db.session.add_all([b1, b2, u1, u2])
    db.session.commit()

print("Seed complete. Logins: admin@acme.com / password123 , admin@greenworks.com / password123")