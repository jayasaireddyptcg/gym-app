import base64
import json
import io
from PIL import Image
from openai import OpenAI
from app.core.config import settings

print("PREDICTOR LOADED — FINAL MVP STABLE VERSION")

# -------------------------------------------------
# OpenAI Client
# -------------------------------------------------
client = OpenAI(api_key=settings.openai_api_key)

# -------------------------------------------------
# Allowed equipment keys (MUST match frontend)
# -------------------------------------------------
ALLOWED_EQUIPMENT_KEYS = {
    "dumbbells",
    "barbell",
    "leg-press",
    "treadmill",
    "elliptical",
    "stationary-bike",
    "cable-machine",
    "smith-machine",
    "pull-up-bar",
    "chest-press",
    "shoulder-press",
    "lat-pulldown",
    "leg-extension",
    "leg-curl",
    "hip-abductor",
    "rowing-machine",
    "stair-climber",
    "pec-deck",
    "preacher-curl",
    "triceps-pushdown",
    "ab-crunch",
    "back-extension",
    "dip-station",
    "kettlebell",
    "resistance-bands",
    "medicine-ball",
    "battle-ropes",
    "punching-bag",
    "unknown",
}

# -------------------------------------------------
# System Prompt (STRICT, VALID)
# -------------------------------------------------
SYSTEM_PROMPT = {
    "role": "system",
    "content": [
        {
            "type": "input_text",
            "text": (
                "You are a gym equipment classifier.\n\n"
                "Return ONLY valid JSON in this exact format:\n"
                "{ \"equipment_key\": \"<key>\", \"confidence\": <number between 0 and 1> }\n\n"
                "Allowed equipment keys:\n"
                + ", ".join(sorted(ALLOWED_EQUIPMENT_KEYS)) +
                "\n\nRules:\n"
                "- No explanations\n"
                "- No extra text\n"
                "- If unsure, use \"unknown\""
            )
        }
    ],
}

# -------------------------------------------------
# Helper: Convert image → base64
# -------------------------------------------------
def image_to_base64(image: Image.Image) -> str:
    if image.mode != "RGB":
        image = image.convert("RGB")

    buffer = io.BytesIO()
    image.save(buffer, format="JPEG")
    return base64.b64encode(buffer.getvalue()).decode("utf-8")

# -------------------------------------------------
# Main prediction function
# -------------------------------------------------
def predict_equipment(image: Image.Image):
    """
    Input: PIL.Image
    Output:
    {
        "equipment_key": str,
        "confidence": float
    }
    """

    image_base64 = image_to_base64(image)

    response = client.responses.create(
        model="gpt-5-nano",
        input=[
            SYSTEM_PROMPT,
            {
                "role": "user",
                "content": [
                    {
                        "type": "input_text",
                        "text": "Identify the gym equipment in this image."
                    },
                    {
                        "type": "input_image",
                        "image_url": f"data:image/jpeg;base64,{image_base64}"
                    }
                ]
            }
        ],
    )

    # -------------------------------------------------
    # Safe JSON parsing
    # -------------------------------------------------
    try:
        raw = response.output_text.strip()
        data = json.loads(raw)

        equipment_key = data.get("equipment_key", "unknown")
        confidence = float(data.get("confidence", 0.0))

        if equipment_key not in ALLOWED_EQUIPMENT_KEYS:
            equipment_key = "unknown"
            confidence = 0.0

    except Exception:
        equipment_key = "unknown"
        confidence = 0.0

    return {
        "equipment_key": equipment_key,
        "confidence": round(confidence, 2),
    }
