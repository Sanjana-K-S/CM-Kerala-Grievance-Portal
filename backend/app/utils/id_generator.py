from sqlalchemy import func

def generate_next_id(db, model):
    current_max = db.query(func.max(model.id)).scalar() or 0
    return current_max + 1
