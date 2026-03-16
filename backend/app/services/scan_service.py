from app.ai.predictor import predict_equipment
from app.services.s3 import load_image_from_s3

def scan_equipment(image_key: str):
    image = load_image_from_s3(image_key)
    result = predict_equipment(image)
    return {"equipment": result}
