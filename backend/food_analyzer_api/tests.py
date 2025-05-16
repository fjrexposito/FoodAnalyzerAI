from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from .models import FoodAnalysis, EstimatedVolume, Ingredient, Calories, Macros
import json

class ModelTestCase(TestCase):
    """Pruebas para los modelos de la aplicación."""
    
    def test_food_analysis_creation(self):
        """Prueba la creación de un objeto FoodAnalysis."""
        food_analysis = FoodAnalysis.objects.create(
            health_rating="Saludable",
            overall_confidence_score=0.95,
            summary="Ensalada de frutas nutritiva",
            overall_nova_classification="Alimentos sin procesar o mínimamente procesados"
        )
        self.assertEqual(FoodAnalysis.objects.count(), 1)
        self.assertEqual(food_analysis.health_rating, "Saludable")
        self.assertEqual(food_analysis.overall_confidence_score, 0.95)
        
    def test_relationships(self):
        """Prueba las relaciones entre modelos."""
        food_analysis = FoodAnalysis.objects.create(
            health_rating="Saludable",
            overall_confidence_score=0.95,
            summary="Ensalada de frutas nutritiva",
            overall_nova_classification="Alimentos sin procesar o mínimamente procesados"
        )
        
        # Crear volumen estimado relacionado con el análisis
        volume = EstimatedVolume.objects.create(
            food_analysis=food_analysis,
            value=250.0,
            unit="gr"
        )
        
        # Crear un ingrediente relacionado con el análisis
        ingredient = Ingredient.objects.create(
            food_analysis=food_analysis,
            name="Manzana",
            nova_classification="Alimentos sin procesar o mínimamente procesados"
        )
        
        # Crear calorías relacionadas con el ingrediente
        calories = Calories.objects.create(
            ingredient=ingredient,
            value=52.0,
            unit="kcal"
        )
        
        # Crear macros relacionados con el ingrediente
        macros = Macros.objects.create(
            ingredient=ingredient,
            protein=0.3,
            carbohydrates=14.0,
            fat=0.2,
            unit="gr"
        )
        
        # Verificar relaciones utilizando los nombres correctos de relaciones inversas
        self.assertEqual(food_analysis.overall_estimated_volume, volume)
        self.assertEqual(food_analysis.ingredients.first(), ingredient)  # El campo se llama 'ingredients', no 'ingredient_set'
        self.assertEqual(ingredient.calories, calories)  # La relación es OneToOne con related_name='calories'
        self.assertEqual(ingredient.macros, macros)  # La relación es OneToOne con related_name='macros'

class APIEndpointTestCase(APITestCase):
    """Pruebas para los endpoints de la API."""
    
    def test_food_analysis_endpoint(self):
        """Prueba que el endpoint de análisis de alimentos funcione correctamente."""
        url = reverse('food-analysis')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)  # GET está permitido y devuelve la lista de análisis
    
    def test_analyze_food_endpoint(self):
        """Prueba que el endpoint principal de análisis de alimentos funcione."""
        url = reverse('analyze-food')
        # Solo verificamos la respuesta sin una imagen válida
        response = self.client.post(url, {}, format='multipart')
        # Esperamos un error de validación ya que no enviamos una imagen
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
