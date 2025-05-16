from django.urls import path
from .views import FoodAnalysisView

urlpatterns = [
    path('analyze-food/', FoodAnalysisView.as_view(), name='analyze-food'),
    path('food-analysis/', FoodAnalysisView.as_view(), name='food-analysis'),  # URL adicional para compatibilidad
]
