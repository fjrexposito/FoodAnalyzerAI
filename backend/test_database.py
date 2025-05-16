import os
import sys
import django
from pathlib import Path
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Agregar el directorio del proyecto para importar django settings
backend_path = Path(__file__).resolve().parent
sys.path.append(str(backend_path))

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import connections
from django.db.utils import OperationalError
from food_analyzer_api.models import FoodAnalysis, EstimatedVolume, Ingredient, Calories, Macros

def test_database_connection():
    """Probar la conexión a la base de datos."""
    try:
        db_conn = connections['default']
        db_conn.cursor()
        logger.info("✅ Conexión a la base de datos exitosa.")
        return True
    except OperationalError:
        logger.error("❌ No se pudo conectar a la base de datos.")
        return False

def test_models():
    """Probar que los modelos estén correctamente configurados."""
    try:
        # Intentar crear y guardar un objeto de cada modelo para verificar
        # que las tablas existen y están correctamente definidas
        
        # Crear un análisis de alimentos
        food_analysis = FoodAnalysis(
            health_rating="Saludable",
            overall_confidence_score=0.95,
            summary="Ensalada de frutas colorida y nutritiva",
            overall_nova_classification="Alimentos sin procesar o mínimamente procesados"
        )
        food_analysis.save()
        logger.info(f"✅ Modelo FoodAnalysis creado correctamente (ID: {food_analysis.id})")
        
        # Crear volumen estimado
        volume = EstimatedVolume(
            food_analysis=food_analysis,
            value=250.0,
            unit="gr"
        )
        volume.save()
        logger.info(f"✅ Modelo EstimatedVolume creado correctamente (ID: {volume.id})")
        
        # Crear un ingrediente
        ingredient = Ingredient(
            food_analysis=food_analysis,
            name="Manzana",
            nova_classification="Alimentos sin procesar o mínimamente procesados"
        )
        ingredient.save()
        logger.info(f"✅ Modelo Ingredient creado correctamente (ID: {ingredient.id})")
        
        # Crear calorías
        calories = Calories(
            ingredient=ingredient,
            value=52.0,
            unit="kcal"
        )
        calories.save()
        logger.info(f"✅ Modelo Calories creado correctamente (ID: {calories.id})")
        
        # Crear macros
        macros = Macros(
            ingredient=ingredient,
            protein=0.3,
            carbohydrates=14.0,
            fat=0.2,
            unit="gr"
        )
        macros.save()
        logger.info(f"✅ Modelo Macros creado correctamente (ID: {macros.id})")
        
        # Eliminar los datos de prueba
        food_analysis.delete()
        logger.info("✅ Datos de prueba eliminados correctamente")
        
        return True
        
    except Exception as e:
        logger.exception(f"❌ Error al probar los modelos: {str(e)}")
        return False

if __name__ == "__main__":
    logger.info("Iniciando pruebas de base de datos...")
    
    db_ok = test_database_connection()
    if not db_ok:
        logger.error("❌ Prueba de conexión a base de datos fallida.")
        sys.exit(1)
        
    models_ok = test_models()
    if not models_ok:
        logger.error("❌ Prueba de modelos fallida.")
        sys.exit(1)
        
    logger.info("✅ Todas las pruebas de base de datos completadas exitosamente.")
    sys.exit(0)
