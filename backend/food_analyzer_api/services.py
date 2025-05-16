import base64
import io
import json
import logging
import traceback
import vertexai
from vertexai.generative_models import GenerativeModel, SafetySetting, Part
from django.core.files.base import ContentFile

# Configurar logger
logger = logging.getLogger(__name__)


# Prompt template para el análisis de alimentos
FOOD_ANALYSIS_PROMPT = """Analiza la imagen del alimento proporcionada. Basándote en la imagen, proporciona la siguiente información en formato JSON.
El objeto JSON principal debe tener las siguientes claves (usa null o arrays vacíos si la información no está disponible o no aplica):
"healthRating": Una cadena de texto entre "Saludable", "Aceptable", "Poco Saludable", "No Saludable".
"overallEstimatedVolume": Un objeto con "value" (número) y "unit" (string, "ml" o "gr").
"overallConfidenceScore": Un número entre 0 y 1 que represente la confianza global del análisis.
"ingredients": Un array de objetos, cada uno con:
 * "name": Nombre del ingrediente (string).
 * "estimatedVolume": Un objeto con "value" y "unit" (opcional).
 * "calories": Un objeto con "value" y "unit" (siempre "kcal") (opcional).
 * "macros": Un objeto con "protein", "carbohydrates", "fat" (todos números) y "unit" (siempre "gr") (opcional).
 * "novaClassification": Clasificación NOVA del ingrediente (opcional).
"summary": Un breve resumen textual del plato/alimento (string).
"overallNovaClassification": La clasificación NOVA general del alimento/plato (string).
Para la clasificación NOVA, usa uno de estos valores:
"Alimentos sin procesar o mínimamente procesados", "Ingredientes culinarios procesados", 
"Alimentos procesados", "Alimentos y bebidas ultraprocesados".
Por favor, asegúrate de que la respuesta sea únicamente el objeto JSON válido."""

def initialize_vertex_ai():
    """Inicializa la API de Vertex AI."""
    try:
        vertexai.init(
            project="foodanalyzerai",
            location="us-central1",
            api_endpoint="us-central1-aiplatform.googleapis.com"
        )
        return True
    except Exception as e:
        logger.error(f"Error inicializando Vertex AI: {str(e)}")
        return False

# Configuración de generación y seguridad para Gemini AI
generation_config = {
    "max_output_tokens": 8192,
    "temperature": 0.2,  # Temperatura más baja para respuestas más deterministas y precisas
    "top_p": 0.95,
}

safety_settings = [
    SafetySetting(
        category=SafetySetting.HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold=SafetySetting.HarmBlockThreshold.OFF
    ),
    SafetySetting(
        category=SafetySetting.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold=SafetySetting.HarmBlockThreshold.OFF
    ),
    SafetySetting(
        category=SafetySetting.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold=SafetySetting.HarmBlockThreshold.OFF
    ),
    SafetySetting(
        category=SafetySetting.HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold=SafetySetting.HarmBlockThreshold.OFF
    ),
]

def analyze_food_image(image_file):
    """
    Analiza una imagen de alimento usando Gemini a través de Vertex AI.
    
    Args:
        image_file: Un archivo de imagen Django (InMemoryUploadedFile o similar)
        
    Returns:
        dict: Resultado del análisis en formato JSON o None si hay un error
    """
    try:
        # Inicializar Vertex AI
        if not initialize_vertex_ai():
            return None
            
        # Crear el modelo generativo
        model = GenerativeModel("gemini-2.0-flash-001")
        
        # Leer la imagen
        image_content = image_file.read()
        
        # Reiniciar el puntero del archivo para que pueda ser leído nuevamente si es necesario
        image_file.seek(0)
        
        # Crear el mensaje con la imagen y el prompt
        image_part = Part.from_data(
            mime_type=image_file.content_type or "image/jpeg",
            data=image_content
        )
        
        # Iniciar el chat y enviar directamente la imagen con el prompt
        chat = model.start_chat()
        
        # Enviar la imagen con el prompt de análisis sin mensaje inicial
        response = chat.send_message(
            [image_part, FOOD_ANALYSIS_PROMPT],
            generation_config=generation_config,
            safety_settings=safety_settings
        )
        
        # Procesar la respuesta
        response_text = response.text
        
        # Intentar extraer JSON de la respuesta
        try:
            # Buscar si hay bloques de código en la respuesta
            if "```json" in response_text:
                # Extraer el contenido entre marcadores de código JSON
                json_start = response_text.find("```json") + 7
                json_end = response_text.find("```", json_start)
                json_content = response_text[json_start:json_end].strip()
                result = json.loads(json_content)
            else:
                # Intentar parsear directamente
                result = json.loads(response_text)
                
            return result
            
        except json.JSONDecodeError:
            logger.error(f"Error al parsear JSON de la respuesta de Gemini: {response_text}")
            return None
            
    except Exception as e:
        logger.exception(f"Error al analizar la imagen con Gemini: {str(e)}")
        logger.error(traceback.format_exc())
        return None