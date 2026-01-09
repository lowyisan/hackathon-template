from flask_jwt_extended import get_jwt_identity
from ..models.user import User

def get_current_user():
    """
    Retrieves the currently authenticated User based on the JWT access token.
    
    This helper uses Flask-JWT-Extended's get_jwt_identity() to find the user ID
    from the request context and fetches the corresponding User object from the database.
    """
    user_id = int(get_jwt_identity())
    return User.query.get(user_id)
