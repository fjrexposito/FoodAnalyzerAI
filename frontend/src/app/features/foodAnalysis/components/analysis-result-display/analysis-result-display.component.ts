import { Component, input, InputSignal } from '@angular/core'; // input para signal inputs
import { CommonModule } from '@angular/common'; // Para @if, @for, pipes, etc.
import { FoodAnalysis, HealthRating, NovaClassification } from '../../models/food-analysis.interface';

@Component({
  selector: 'app-analysis-result-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './analysis-result-display.component.html',
  styleUrls: ['./analysis-result-display.component.scss']
})
export class AnalysisResultDisplayComponent {
  analysisData: InputSignal<FoodAnalysis> = input.required<FoodAnalysis>();

  constructor() { }

  // Método para obtener la clase CSS según la clasificación de salud
  getHealthRatingClass(rating?: HealthRating): string {
    if (!rating) return 'text-muted';
    switch (rating) {
      case 'Saludable': return 'health-rating good';
      case 'Aceptable': return 'health-rating acceptable';
      case 'Poco Saludable': return 'health-rating poor';
      case 'No Saludable': return 'health-rating poor';
      default: return 'text-muted';
    }
  }

  getNovaClass(nova?: NovaClassification): string {
    if (!nova) return '';
    if (nova.includes('sin procesar')) return 'nova-classification unprocessed';
    if (nova.includes('ultraprocesados')) return 'nova-classification ultra-processed';
    if (nova.includes('procesados')) return 'nova-classification processed';
    if (nova.includes('Ingredientes culinarios')) return 'nova-classification processed';
    return 'nova-classification';
  }

  // Método para obtener una versión simplificada de la clasificación NOVA
  getSimplifiedNovaText(nova?: NovaClassification): string {
    if (!nova) return 'No disponible';
    if (nova.includes('ultraprocesados')) return 'Ultraprocesado';
    if (nova.includes('procesados') && !nova.includes('Ingredientes') && !nova.includes('mínimamente')) return 'Procesado';
    if (nova.includes('Ingredientes culinarios')) return 'Ing. Culinario';
    if (nova.includes('sin procesar') || nova.includes('mínimamente')) return 'Sin/Mín. Procesado';
    return nova.slice(0, 20) + '...';
  }
}
