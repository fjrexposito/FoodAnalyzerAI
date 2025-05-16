#!/bin/bash

# Script para configurar el entorno de desarrollo de FoodAnalyzerAI
# Este script debe ejecutarse antes de iniciar el servidor Django

# Colores para salida en consola
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=======================================================${NC}"
echo -e "${BLUE}   Configurando entorno para FoodAnalyzerAI Backend    ${NC}"
echo -e "${BLUE}=======================================================${NC}"

# Función para verificar si un comando está disponible
command_exists() {
    command -v "$1" &> /dev/null
}

# Verificar instalación de pip e instalar dependencias
echo -e "${YELLOW}Verificando dependencias de Python...${NC}"
if command_exists pip; then
    echo -e "${GREEN}Instalando dependencias...${NC}"
    
    # Primero instala Django y dependencias básicas para asegurar que no haya conflictos
    pip install "Django>=4.2,<5.0" "djangorestframework==3.15.1" "django-cors-headers==4.7.0" "Pillow>=9.0.0" "python-dotenv>=1.0.0"
    
    # Luego instalar las dependencias de Google Cloud que tienen que coincidir en versiones
    pip install "google-cloud-aiplatform==1.71.1" "vertexai==1.71.1"
    
    # Verificar si Django se instaló correctamente
    if python -c "import django; print(f'Django {django.__version__} instalado correctamente.')" &> /dev/null; then
        echo -e "${GREEN}Dependencias base instaladas correctamente.${NC}"
    else
        echo -e "${RED}Error: No se pudo importar Django después de la instalación.${NC}"
        exit 1
    fi
    
    # Verificar las dependencias de Google Cloud
    if python -c "import google.cloud.aiplatform; import vertexai; print(f'Google Cloud AI Platform y Vertex AI instalados correctamente.')" &> /dev/null; then
        echo -e "${GREEN}Dependencias de Google Cloud instaladas correctamente.${NC}"
    else
        echo -e "${YELLOW}Advertencia: Posibles problemas con las dependencias de Google Cloud.${NC}"
        
        if python -c "import django; print(f'Django {django.__version__} instalado correctamente.')" &> /dev/null; then
            echo -e "${GREEN}Dependencias instaladas correctamente en el segundo intento.${NC}"
        else
            echo -e "${RED}Error: La instalación de Django falló. Por favor, instala manualmente.${NC}"
            exit 1
        fi
    fi
else
    echo -e "${RED}Error: pip no está instalado. Por favor, instala Python y pip.${NC}"
    exit 1
fi

# Verificar si gcloud CLI está instalado
echo -e "${YELLOW}Verificando Google Cloud CLI...${NC}"
if command_exists gcloud; then
    echo -e "${GREEN}Google Cloud CLI encontrado.${NC}"
else
    echo -e "${YELLOW}Google Cloud CLI no encontrado. Instalando...${NC}"
    # Instalación de gcloud CLI para Debian siguiendo instrucciones oficiales
    echo -e "${YELLOW}Configurando repositorio de Google Cloud SDK...${NC}"
    
    # Instalar los paquetes requeridos
    apt-get update && apt-get install -y apt-transport-https ca-certificates gnupg curl
    
    # Añadir la clave pública de Google Cloud
    curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key add -
    
    # Añadir el repositorio de Google Cloud SDK
    echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | tee -a /etc/apt/sources.list.d/google-cloud-sdk.list
    
    # Importar la clave pública de Google
    curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key --keyring /usr/share/keyrings/cloud.google.gpg add -
    
    # Actualizar e instalar el SDK
    apt-get update && apt-get install -y google-cloud-cli
    
    echo -e "${GREEN}Google Cloud CLI instalado correctamente.${NC}"
fi

# Se ha movido la autenticación de Google Cloud al script start_server.sh

echo -e "${BLUE}=======================================================${NC}"
echo -e "${GREEN}Entorno configurado con éxito. Puedes iniciar el servidor Django.${NC}"
echo -e "${BLUE}=======================================================${NC}"


