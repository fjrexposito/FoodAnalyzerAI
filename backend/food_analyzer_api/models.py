from django.db import models

class FoodAnalysis(models.Model):
    """Modelo para almacenar los resultados del análisis de alimentos."""
    HEALTH_RATING_CHOICES = [
        ('Saludable', 'Saludable'),
        ('Aceptable', 'Aceptable'),
        ('Poco Saludable', 'Poco Saludable'),
        ('No Saludable', 'No Saludable'),
    ]
    
    NOVA_CLASSIFICATION_CHOICES = [
        ('Alimentos sin procesar o mínimamente procesados', 'Alimentos sin procesar o mínimamente procesados'),
        ('Ingredientes culinarios procesados', 'Ingredientes culinarios procesados'),
        ('Alimentos procesados', 'Alimentos procesados'),
        ('Alimentos y bebidas ultraprocesados', 'Alimentos y bebidas ultraprocesados'),
    ]
    
    image = models.ImageField(upload_to='food_images/', null=True, blank=True)
    health_rating = models.CharField(max_length=30, choices=HEALTH_RATING_CHOICES, null=True, blank=True)
    overall_confidence_score = models.FloatField(null=True, blank=True)
    summary = models.TextField(null=True, blank=True)
    overall_nova_classification = models.CharField(max_length=100, choices=NOVA_CLASSIFICATION_CHOICES, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Análisis de Alimento"
        verbose_name_plural = "Análisis de Alimentos"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Análisis {self.id} - {self.health_rating or 'Sin clasificar'}"


class EstimatedVolume(models.Model):
    """Modelo para representar volúmenes estimados."""
    UNIT_CHOICES = [
        ('ml', 'ml'),
        ('gr', 'gr'),
    ]
    
    food_analysis = models.OneToOneField(FoodAnalysis, on_delete=models.CASCADE, related_name='overall_estimated_volume', null=True, blank=True)
    ingredient = models.OneToOneField('Ingredient', on_delete=models.CASCADE, related_name='estimated_volume', null=True, blank=True)
    value = models.FloatField()
    unit = models.CharField(max_length=5, choices=UNIT_CHOICES)
    
    def __str__(self):
        return f"{self.value} {self.unit}"


class Calories(models.Model):
    """Modelo para representar calorías."""
    UNIT_CHOICES = [
        ('kcal', 'kcal'),
    ]
    
    ingredient = models.OneToOneField('Ingredient', on_delete=models.CASCADE, related_name='calories')
    value = models.FloatField()
    unit = models.CharField(max_length=10, choices=UNIT_CHOICES, default='kcal')
    
    def __str__(self):
        return f"{self.value} {self.unit}"


class Macros(models.Model):
    """Modelo para representar macronutrientes."""
    UNIT_CHOICES = [
        ('gr', 'gr'),
    ]
    
    ingredient = models.OneToOneField('Ingredient', on_delete=models.CASCADE, related_name='macros')
    protein = models.FloatField()
    carbohydrates = models.FloatField()
    fat = models.FloatField()
    unit = models.CharField(max_length=5, choices=UNIT_CHOICES, default='gr')
    
    def __str__(self):
        return f"P:{self.protein} C:{self.carbohydrates} F:{self.fat} {self.unit}"


class Ingredient(models.Model):
    """Modelo para representar ingredientes."""
    food_analysis = models.ForeignKey(FoodAnalysis, on_delete=models.CASCADE, related_name='ingredients')
    name = models.CharField(max_length=200)
    nova_classification = models.CharField(max_length=100, choices=FoodAnalysis.NOVA_CLASSIFICATION_CHOICES, null=True, blank=True)
    
    def __str__(self):
        return self.name
