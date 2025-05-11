// Tipos para las unidades y clasificaciones específicas
export type HealthRating = 'Saludable' | 'Aceptable' | 'Poco Saludable' | 'No Saludable';
type VolumeUnit = 'ml' | 'gr';
type MacroUnit = 'gr';
type CalorieUnit = 'kcal';

// Clasificación NOVA
export type NovaClassification =
  | 'Alimentos sin procesar o mínimamente procesados'
  | 'Ingredientes culinarios procesados'
  | 'Alimentos procesados'
  | 'Alimentos y bebidas ultraprocesados'
  | string;

// Interfaz para representar un volumen estimado
export interface EstimatedVolume {
  value: number;
  unit: VolumeUnit;
}

// Interfaz para representar calorías
export interface Calories {
  value: number;
  unit: CalorieUnit;
}

// Interfaz para representar macronutrientes
export interface Macros {
  protein: number;
  carbohydrates: number;
  fat: number;
  unit: MacroUnit;
}

// Interfaz para cada ingrediente (si es un plato combinado)
export interface Ingredient {
  name: string;
  estimatedVolume?: EstimatedVolume;
  calories?: Calories;
  macros?: Macros;
  novaClassification?: NovaClassification;
}

// Interfaz principal para el resultado del análisis del alimento
export interface FoodAnalysis {
  healthRating?: HealthRating;
  overallEstimatedVolume?: EstimatedVolume;
  overallConfidenceScore?: number;
  ingredients?: Ingredient[];
  summary?: string;
  overallNovaClassification?: NovaClassification; // Clasificación NOVA general del alimento/plato
}
