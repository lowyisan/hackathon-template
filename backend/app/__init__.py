from flask import Flask
from .config import Config
from .extensions import db, jwt, cors

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app)

    # Import and register routes
    from .routes.auth_routes import auth_bp
    from .routes.balance_routes import balance_bp
    from .routes.request_routes import request_bp
    from .routes.alert_routes import alert_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(balance_bp, url_prefix="/api/me")
    app.register_blueprint(request_bp, url_prefix="/api/me")
    app.register_blueprint(alert_bp, url_prefix="/api/me")

    return app
