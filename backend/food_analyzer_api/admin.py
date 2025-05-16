from django.contrib import admin
from .models import FoodAnalysis, EstimatedVolume, Calories, Macros, Ingredient

# Registrar los modelos para que aparezcan en el panel de administración
@admin.register(FoodAnalysis)
class FoodAnalysisAdmin(admin.ModelAdmin):
    list_display = ('id', 'health_rating', 'overall_confidence_score', 'overall_nova_classification', 'created_at')
    search_fields = ('id', 'health_rating', 'summary')
    list_filter = ('health_rating', 'overall_nova_classification', 'created_at')

@admin.register(Ingredient)
class IngredientAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'nova_classification', 'get_food_analysis')
    search_fields = ('name', 'nova_classification')
    list_filter = ('nova_classification',)
    
    def get_food_analysis(self, obj):
        return obj.food_analysis.id
    get_food_analysis.short_description = 'Análisis ID'

@admin.register(EstimatedVolume)
class EstimatedVolumeAdmin(admin.ModelAdmin):
    list_display = ('id', 'value', 'unit')

@admin.register(Calories)
class CaloriesAdmin(admin.ModelAdmin):
    list_display = ('id', 'value', 'unit', 'get_ingredient')
    
    def get_ingredient(self, obj):
        return obj.ingredient.name
    get_ingredient.short_description = 'Ingrediente'

@admin.register(Macros)
class MacrosAdmin(admin.ModelAdmin):
    list_display = ('id', 'protein', 'carbohydrates', 'fat', 'unit', 'get_ingredient')
    
    def get_ingredient(self, obj):
        return obj.ingredient.name
    get_ingredient.short_description = 'Ingrediente'
