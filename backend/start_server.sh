#!/bin/bash

# Script para iniciar el servidor de desarrollo de FoodAnalyzerAI
# Este script ejecuta el setup de entorno y luego inicia el servidor Django

# Colores para salida en consola
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=======================================================${NC}"
echo -e "${BLUE}         Iniciando FoodAnalyzerAI Backend              ${NC}"
echo -e "${BLUE}=======================================================${NC}"

# Ruta al directorio del proyecto
PROJECT_DIR="/workspaces/FoodAnalyzerAI"

# Ejecutar el script de configuración del entorno
echo -e "${YELLOW}Configurando entorno...${NC}"
bash "$PROJECT_DIR/backend/setup_environment.sh"

# Verificar si el script de configuración se ejecutó correctamente
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Entorno configurado correctamente.${NC}"
    
    # Cambiar al directorio del backend
    cd "$PROJECT_DIR/backend"
    
    # Verificar si Django está instalado correctamente
    if ! python -c "import django" &> /dev/null; then
        echo -e "${RED}ERROR: Django no está instalado o no puede ser importado.${NC}"
        echo -e "${YELLOW}Instalando Django y dependencias básicas...${NC}"
        pip install "Django>=4.2,<5.0" "djangorestframework==3.15.1" "django-cors-headers==4.7.0" "Pillow>=9.0.0" "python-dotenv>=1.0.0"
        
        if ! python -c "import django" &> /dev/null; then
            echo -e "${RED}ERROR CRÍTICO: No se puede importar Django después de reinstalar.${NC}"
            echo -e "${RED}Por favor, verifique manualmente la instalación con: pip install Django>=4.2${NC}"
            exit 1
        fi
    fi
    
    # Verificar dependencias de Google Cloud
    if ! python -c "import google.cloud.aiplatform" &> /dev/null || ! python -c "import vertexai" &> /dev/null; then
        echo -e "${YELLOW}Instalando dependencias de Google Cloud...${NC}"
        pip install "google-cloud-aiplatform==1.71.1" "vertexai==1.71.1"
    fi
    
    # Verificar autenticación de Google Cloud
    echo -e "${YELLOW}Verificando autenticación de Google Cloud...${NC}"
    # Verificar si existen credenciales de ADC (Application Default Credentials)
    if [ -f "$HOME/.config/gcloud/application_default_credentials.json" ]; then
        echo -e "${GREEN}Las credenciales de aplicación predeterminadas (ADC) ya existen.${NC}"
        
        # Intentar obtener el nombre de cuenta si es posible
        ACCOUNT=$(gcloud info --format="value(config.account)" 2>/dev/null)
        if [ ! -z "$ACCOUNT" ]; then
            echo -e "${GREEN}Ya autenticado como: ${ACCOUNT}${NC}"
        fi
    else
        echo -e "${YELLOW}No se ha encontrado una autenticación válida.${NC}"
        
        # Verificar si estamos en un entorno sin interfaz gráfica
        if [ -z "$DISPLAY" ] && [ -z "$BROWSER" ]; then
            echo -e "${YELLOW}Ejecutando en entorno sin navegador. Puedes configurar la autenticación manualmente más tarde.${NC}"
            echo -e "${YELLOW}Para autenticar, ejecuta: gcloud auth application-default login${NC}"
            
            # Preguntar si desea continuar sin autenticación
            echo -e "${YELLOW}¿Desea continuar sin autenticación? (s/n)${NC}"
            read -r continue_without_auth
            
            if [[ "$continue_without_auth" != "s" && "$continue_without_auth" != "S" ]]; then
                echo -e "${RED}Configuración cancelada. Por favor, autentícate manualmente.${NC}"
                exit 1
            fi
            
            echo -e "${YELLOW}Continuando sin autenticación...${NC}"
        else
            echo -e "${YELLOW}Iniciando proceso de autenticación...${NC}"
            # Ejecutar autenticación de aplicación predeterminada
            gcloud auth application-default login
            
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}Autenticación completada con éxito.${NC}"
            else
                echo -e "${RED}Error en la autenticación. Por favor, inténtalo manualmente con 'gcloud auth application-default login'.${NC}"
                exit 1
            fi
        fi
    fi
    
    # Verificar proyecto de GCP
    echo -e "${YELLOW}Verificando proyecto de GCP...${NC}"
    PROJECT=$(gcloud config get-value project)
    if [ -z "$PROJECT" ]; then
        echo -e "${YELLOW}No hay un proyecto GCP seleccionado. Estableciendo 'foodanalyzerai' como proyecto predeterminado...${NC}"
        gcloud config set project foodanalyzerai
        echo -e "${GREEN}Proyecto configurado: foodanalyzerai${NC}"
    else
        echo -e "${GREEN}Proyecto configurado: ${PROJECT}${NC}"
    fi
    
    # Verificar si hay migraciones pendientes
    echo -e "${YELLOW}Verificando migraciones...${NC}"
    export DJANGO_SETTINGS_MODULE="backend.settings"
    python manage.py makemigrations
    python manage.py migrate
    
    # Iniciar el servidor Django
    echo -e "${GREEN}Iniciando servidor Django...${NC}"
    echo -e "${BLUE}=======================================================${NC}"
    python manage.py runserver 0.0.0.0:8000
else
    echo -e "${RED}Error al configurar el entorno. Verifica los errores anteriores.${NC}"
    exit 1
fi
