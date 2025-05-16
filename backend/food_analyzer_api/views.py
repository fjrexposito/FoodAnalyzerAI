from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from .models import FoodAnalysis, EstimatedVolume, Calories, Macros, Ingredient
from .serializers import FoodAnalysisSerializer
from .services import analyze_food_image
import logging
import json
import traceback

# Configurar logger
logger = logging.getLogger(__name__)

class FoodAnalysisView(APIView):
    """Vista para procesar solicitudes de análisis de alimentos."""
    parser_classes = (MultiPartParser, FormParser)
    
    def post(self, request, *args, **kwargs):
        """Procesa la solicitud POST para analizar una imagen de alimento."""
        # Verificar si se incluye una imagen en la solicitud
        if 'image' not in request.FILES:
            return Response(
                {"error": "No se ha proporcionado ninguna imagen"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        image_file = request.FILES['image']
        
        # Analizar la imagen con Gemini a través de Vertex AI
        analysis_result = analyze_food_image(image_file)
        
        if analysis_result is None:
            return Response(
                {"error": "No se pudo analizar la imagen con la API de Gemini"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        try:
            # Guardar el resultado del análisis en la base de datos
            food_analysis = FoodAnalysis(
                image=image_file,
                health_rating=analysis_result.get('healthRating'),
                overall_confidence_score=analysis_result.get('overallConfidenceScore'),
                summary=analysis_result.get('summary'),
                overall_nova_classification=analysis_result.get('overallNovaClassification')
            )
            food_analysis.save()
            
            # Guardar el volumen estimado general
            if 'overallEstimatedVolume' in analysis_result and analysis_result['overallEstimatedVolume']:
                EstimatedVolume.objects.create(
                    food_analysis=food_analysis,
                    value=analysis_result['overallEstimatedVolume'].get('value'),
                    unit=analysis_result['overallEstimatedVolume'].get('unit')
                )
            
            # Guardar los ingredientes
            if 'ingredients' in analysis_result and analysis_result['ingredients']:
                for ing_data in analysis_result['ingredients']:
                    # Crear el ingrediente
                    ingredient = Ingredient.objects.create(
                        food_analysis=food_analysis,
                        name=ing_data.get('name'),
                        nova_classification=ing_data.get('novaClassification')
                    )
                    
                    # Guardar volumen estimado del ingrediente
                    if 'estimatedVolume' in ing_data and ing_data['estimatedVolume']:
                        EstimatedVolume.objects.create(
                            ingredient=ingredient,
                            value=ing_data['estimatedVolume'].get('value'),
                            unit=ing_data['estimatedVolume'].get('unit')
                        )
                    
                    # Guardar calorías del ingrediente
                    if 'calories' in ing_data and ing_data['calories']:
                        Calories.objects.create(
                            ingredient=ingredient,
                            value=ing_data['calories'].get('value'),
                            unit=ing_data['calories'].get('unit')
                        )
                    
                    # Guardar macros del ingrediente
                    if 'macros' in ing_data and ing_data['macros']:
                        Macros.objects.create(
                            ingredient=ingredient,
                            protein=ing_data['macros'].get('protein', 0),
                            carbohydrates=ing_data['macros'].get('carbohydrates', 0),
                            fat=ing_data['macros'].get('fat', 0),
                            unit=ing_data['macros'].get('unit')
                        )
            
            # Serializar y devolver el resultado
            serializer = FoodAnalysisSerializer(food_analysis)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.exception(f"Error al guardar el análisis en la base de datos: {str(e)}")
            # Si hay un error al guardar en la base de datos, devolvemos al menos el resultado del análisis
            return Response(
                analysis_result, 
                status=status.HTTP_200_OK
            )

    def get(self, request, *args, **kwargs):
        """Obtiene los análisis de alimentos guardados."""
        analyses = FoodAnalysis.objects.all()
        serializer = FoodAnalysisSerializer(analyses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
