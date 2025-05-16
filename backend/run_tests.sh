#!/bin/bash
# Script para ejecutar todas las pruebas del backend

echo "🚀 Iniciando tests del backend de FoodAnalyzerAI"
echo "==============================================="

# Variables para seguimiento
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Colores para la salida
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Directorio del proyecto
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

# Función para ejecutar un test
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    ((TOTAL_TESTS++))
    echo -e "${BLUE}[TEST ${TOTAL_TESTS}]${NC} Ejecutando: ${test_name}..."
    
    # Ejecutar el comando de prueba
    if eval "$test_command"; then
        echo -e "${GREEN}✅ PASADO${NC}: $test_name"
        ((PASSED_TESTS++))
        return 0
    else
        echo -e "${RED}❌ FALLIDO${NC}: $test_name"
        ((FAILED_TESTS++))
        return 1
    fi
}

# Verificar migración de base de datos
echo -e "\n${YELLOW}Verificando migraciones de base de datos...${NC}"
run_test "Verificar migraciones" "python manage.py showmigrations | grep -q '\[X\]'"

# Ejecutar prueba de base de datos
echo -e "\n${YELLOW}Ejecutando prueba de conexión a base de datos...${NC}"
run_test "Test de base de datos" "python test_database.py"

# Verificar configuración de Google Cloud para Vertex AI
echo -e "\n${YELLOW}Verificando configuración de Google Cloud...${NC}"
if [ -f "$HOME/.config/gcloud/application_default_credentials.json" ]; then
    echo -e "${GREEN}✅ Configuración de autenticación de Google Cloud encontrada${NC}"
else
    echo -e "${YELLOW}⚠️ Credenciales de Google Cloud no encontradas.${NC}"
    echo -e "Si es necesario, ejecuta: gcloud auth application-default login"
    echo -e "No es un error crítico, se usarán datos simulados en modo de desarrollo."
fi

# Ejecutar test unitarios de Django
echo -e "\n${YELLOW}Ejecutando tests unitarios de Django...${NC}"
run_test "Tests unitarios Django" "python manage.py test food_analyzer_api"

# Comprobar API Gemini/Vertex AI
echo -e "\n${YELLOW}Comprobando la configuración de API Gemini/Vertex AI...${NC}"
if [ -f "test_data/food_sample.jpg" ]; then
    # Crear un script temporal para probar la conexión con Vertex AI
    cat > test_vertex_connection.py << 'EOL'
import os
import sys
from pathlib import Path
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Agregar el directorio del proyecto para importar django settings
backend_path = Path(__file__).resolve().parent
sys.path.append(str(backend_path))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

try:
    import django
    django.setup()
    from food_analyzer_api.services import initialize_vertex_ai
    
    if initialize_vertex_ai():
        logger.info("✅ Conexión con Vertex AI establecida correctamente")
        sys.exit(0)
    else:
        logger.error("❌ No se pudo establecer la conexión con Vertex AI")
        sys.exit(1)
except Exception as e:
    logger.error(f"❌ Error al verificar la conexión con Vertex AI: {str(e)}")
    sys.exit(1)
EOL

    run_test "Test de conexión con Vertex AI" "python test_vertex_connection.py"
    # Eliminar el script temporal después de la prueba
    rm test_vertex_connection.py
else
    echo -e "${YELLOW}⚠️ Omitiendo prueba de API Gemini/Vertex AI: No se encontró imagen de prueba${NC}"
    echo -e "Por favor, asegúrate de que exista el archivo test_data/food_sample.jpg"
fi

# Resumen
echo -e "\n${YELLOW}=== Resumen de pruebas ===${NC}"
echo -e "Total: ${TOTAL_TESTS}"
echo -e "${GREEN}Pasadas: ${PASSED_TESTS}${NC}"
echo -e "${RED}Fallidas: ${FAILED_TESTS}${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "\n${GREEN}🎉 ¡Todas las pruebas pasaron correctamente!${NC}"
    exit 0
else
    echo -e "\n${RED}❌ Algunas pruebas fallaron. Por favor, revisa los errores.${NC}"
    exit 1
fi
