import { Component, inject, signal, WritableSignal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { filter, switchMap, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';

// Servicios y Modelos del Core (ajusta las rutas relativas si es necesario)
import { GeminiMultimodalApiService } from '../../../core/services/gemini-multimodal-api.service';
import { FoodAnalysis } from '../models/food-analysis.interface';

// Componentes hijos (de presentación) que estarán en la carpeta 'components'
import { ImageCaptureComponent } from '../components/image-capture/image-capture.component';
import { AnalysisResultDisplayComponent } from '../components/analysis-result-display/analysis-result-display.component';
// import { LoadingIndicatorComponent } from '../components/loading-indicator/loading-indicator.component';

@Component({
  selector: 'app-food-analysis',
  standalone: true,
  imports: [
    CommonModule,
    ImageCaptureComponent,
    AnalysisResultDisplayComponent
    // LoadingIndicatorComponent
  ],
  templateUrl: './food-analysis.component.html',
  styleUrls: ['./food-analysis.component.scss']
})
export class FoodAnalysisComponent {
  private geminiService = inject(GeminiMultimodalApiService);

  public imageToAnalyze = signal<File | string | null>(null);
  public analysisResult = signal<FoodAnalysis | null>(null);
  public isLoading = signal<boolean>(false);
  public errorMessage = signal<string | null>(null);

  constructor() {

    effect(() => {
      const image = this.imageToAnalyze();

      if (image !== null) {
        this.isLoading.set(true);
        this.errorMessage.set(null);

        this.geminiService.analyzeImage(image).subscribe({
          next: (result) => {
            this.analysisResult.set(result);
            this.isLoading.set(false);
          },
          error: (error) => {
            console.error('Error al analizar la imagen:', error);
            this.errorMessage.set('Hubo un problema al analizar la imagen. Intenta de nuevo.');
            this.isLoading.set(false);
          }
        });
      }
    });
  }

  public handleImageSelected(imageFile: File | string): void {
    this.imageToAnalyze.set(imageFile);
  }
}
