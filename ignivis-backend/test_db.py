import database
import models
import auth

try:
    print("Testing DB creation")
    models.Base.metadata.create_all(bind=database.engine)
    print("DB created")
    
    print("Testing password hash")
    h = auth.get_password_hash("test")
    print("Hash:", h)
except Exception as e:
    import traceback
    traceback.print_exc()
