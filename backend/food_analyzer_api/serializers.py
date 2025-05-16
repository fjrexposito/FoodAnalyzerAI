from rest_framework import serializers
from .models import FoodAnalysis, EstimatedVolume, Calories, Macros, Ingredient

class EstimatedVolumeSerializer(serializers.ModelSerializer):
    class Meta:
        model = EstimatedVolume
        fields = ['value', 'unit']

class CaloriesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Calories
        fields = ['value', 'unit']

class MacrosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Macros
        fields = ['protein', 'carbohydrates', 'fat', 'unit']

class IngredientSerializer(serializers.ModelSerializer):
    estimated_volume = EstimatedVolumeSerializer(read_only=True)
    calories = CaloriesSerializer(read_only=True)
    macros = MacrosSerializer(read_only=True)
    
    class Meta:
        model = Ingredient
        fields = ['name', 'estimated_volume', 'calories', 'macros', 'nova_classification']

class FoodAnalysisSerializer(serializers.ModelSerializer):
    overall_estimated_volume = EstimatedVolumeSerializer(read_only=True)
    ingredients = IngredientSerializer(many=True, read_only=True)
    image = serializers.ImageField(write_only=True, required=False)
    
    class Meta:
        model = FoodAnalysis
        fields = [
            'id', 'image', 'health_rating', 'overall_estimated_volume',
            'overall_confidence_score', 'ingredients', 'summary',
            'overall_nova_classification', 'created_at'
        ]

    def to_representation(self, instance):
        """
        Convert the object to a format that matches the frontend TypeScript interface.
        """
        representation = super().to_representation(instance)
        
        # Rename keys to match frontend format
        if 'health_rating' in representation:
            representation['healthRating'] = representation.pop('health_rating')
        if 'overall_confidence_score' in representation:
            representation['overallConfidenceScore'] = representation.pop('overall_confidence_score')
        if 'overall_estimated_volume' in representation:
            representation['overallEstimatedVolume'] = representation.pop('overall_estimated_volume')
        if 'overall_nova_classification' in representation:
            representation['overallNovaClassification'] = representation.pop('overall_nova_classification')
        
        # Remove fields not needed in frontend
        representation.pop('created_at', None)
        representation.pop('id', None)
        
        return representation
