import base64
import json
import io
from PIL import Image
from openai import OpenAI
from app.core.config import settings

print("FOOD PREDICTOR LOADED - GPT Vision Model for Food Analysis")

# OpenAI Client
client = OpenAI(api_key=settings.openai_api_key)

# System Prompt for Food Analysis
SYSTEM_PROMPT = {
    "role": "system",
    "content": [
        {
            "type": "input_text",
            "text": (
                "You are a nutrition expert AI. Analyze the food in this image and return detailed nutritional information.\n\n"
                "Return ONLY valid JSON in this exact format:\n"
                "{\n"
                "  \"foods\": [\n"
                "    {\n"
                "      \"name\": \"food name\",\n"
                "      \"category\": \"category (Fruit, Vegetable, Meat, Dairy, Grain, Nuts, Oil, etc)\",\n"
                "      \"quantity_g\": estimated weight in grams,\n"
                "      \"calories\": calories,\n"
                "      \"protein_g\": protein in grams,\n"
                "      \"carbs_g\": carbohydrates in grams,\n"
                "      \"fat_g\": fat in grams,\n"
                "      \"fiber_g\": fiber in grams,\n"
                "      \"sugar_g\": sugar in grams,\n"
                "      \"sodium_mg\": sodium in milligrams\n"
                "    }\n"
                "  ],\n"
                "  \"confidence\": confidence_score_between_0_and_1,\n"
                "  \"total_calories\": total_calories_all_items,\n"
                "  \"total_protein_g\": total_protein_all_items,\n"
                "  \"total_carbs_g\": total_carbs_all_items,\n"
                "  \"total_fat_g\": total_fat_all_items\n"
                "}\n\n"
                "Rules:\n"
                "- Estimate quantities based on visual portion size\n"
                "- Use standard nutritional values for common foods\n"
                "- Be conservative with estimates\n"
                "- If unsure about an item, exclude it rather than guess incorrectly\n"
                "- Return empty foods array if no food is clearly visible\n"
                "- No explanations or extra text\n"
                "- All numeric values should be reasonable and realistic"
            )
        }
    ],
}

def image_to_base64(image: Image.Image) -> str:
    """Convert PIL Image to base64 string"""
    if image.mode != "RGB":
        image = image.convert("RGB")

    buffer = io.BytesIO()
    image.save(buffer, format="JPEG")
    return base64.b64encode(buffer.getvalue()).decode("utf-8")

def predict_food_nutrition(image: Image.Image):
    """
    Analyze food image and return nutritional information
    
    Args:
        image: PIL Image object
        
    Returns:
        dict: Nutritional analysis with food items and totals
    """
    
    image_base64 = image_to_base64(image)

    try:
        response = client.responses.create(
            model="gpt-5-nano",
            input=[
                SYSTEM_PROMPT,
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "input_text",
                            "text": "Analyze the food in this image and provide detailed nutritional information."
                        },
                        {
                            "type": "input_image",
                            "image_url": f"data:image/jpeg;base64,{image_base64}"
                        }
                    ]
                }
            ],
        )

        # Parse the JSON response
        raw = response.output_text.strip()
        data = json.loads(raw)

        # Validate and clean the data
        foods = data.get("foods", [])
        confidence = float(data.get("confidence", 0.0))
        
        # Ensure confidence is between 0 and 1
        confidence = max(0.0, min(1.0, confidence))
        
        # Validate each food item
        validated_foods = []
        for food in foods:
            if all(key in food for key in ["name", "quantity_g", "calories", "protein_g", "carbs_g", "fat_g"]):
                # Ensure numeric values are valid
                validated_food = {
                    "name": str(food.get("name", "Unknown")),
                    "category": str(food.get("category", "Other")),
                    "quantity_g": max(0, float(food.get("quantity_g", 0))),
                    "calories": max(0, float(food.get("calories", 0))),
                    "protein_g": max(0, float(food.get("protein_g", 0))),
                    "carbs_g": max(0, float(food.get("carbs_g", 0))),
                    "fat_g": max(0, float(food.get("fat_g", 0))),
                    "fiber_g": max(0, float(food.get("fiber_g", 0))),
                    "sugar_g": max(0, float(food.get("sugar_g", 0))),
                    "sodium_mg": max(0, float(food.get("sodium_mg", 0)))
                }
                validated_foods.append(validated_food)

        # Calculate totals if not provided or validate provided totals
        total_calories = sum(food["calories"] for food in validated_foods)
        total_protein_g = sum(food["protein_g"] for food in validated_foods)
        total_carbs_g = sum(food["carbs_g"] for food in validated_foods)
        total_fat_g = sum(food["fat_g"] for food in validated_foods)

        result = {
            "foods": validated_foods,
            "confidence": round(confidence, 2),
            "total_calories": round(total_calories, 2),
            "total_protein_g": round(total_protein_g, 2),
            "total_carbs_g": round(total_carbs_g, 2),
            "total_fat_g": round(total_fat_g, 2),
            "total_fiber_g": round(sum(food["fiber_g"] for food in validated_foods), 2),
            "total_sugar_g": round(sum(food["sugar_g"] for food in validated_foods), 2),
            "total_sodium_mg": round(sum(food["sodium_mg"] for food in validated_foods), 2)
        }

    except json.JSONDecodeError:
        # Handle JSON parsing errors
        result = {
            "foods": [],
            "confidence": 0.0,
            "total_calories": 0.0,
            "total_protein_g": 0.0,
            "total_carbs_g": 0.0,
            "total_fat_g": 0.0,
            "total_fiber_g": 0.0,
            "total_sugar_g": 0.0,
            "total_sodium_mg": 0.0,
            "error": "Failed to parse nutrition analysis"
        }
    except Exception as e:
        # Handle other errors
        result = {
            "foods": [],
            "confidence": 0.0,
            "total_calories": 0.0,
            "total_protein_g": 0.0,
            "total_carbs_g": 0.0,
            "total_fat_g": 0.0,
            "total_fiber_g": 0.0,
            "total_sugar_g": 0.0,
            "total_sodium_mg": 0.0,
            "error": f"Analysis failed: {str(e)}"
        }

    return result
