import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { FoodAnalysis } from '../../features/foodAnalysis/models/food-analysis.interface';

@Injectable({
  providedIn: 'root'
})
export class BackendApiService {
  private apiUrl = 'http://localhost:8000/api'; // URL de nuestro backend Django

  constructor(private http: HttpClient) {}

  /**
   * Envía una imagen al backend para análisis utilizando la API de Gemini
   * @param imageFile Archivo de imagen a analizar
   */
  analyzeImage(imageFile: File): Observable<FoodAnalysis | null> {
    console.log('BackendApiService: Enviando imagen al backend para análisis:', imageFile);

    const formData = new FormData();
    formData.append('image', imageFile);

    return this.http.post<FoodAnalysis>(`${this.apiUrl}/analyze-food/`, formData).pipe(
      tap(response => {
        console.log('Respuesta del backend:', response);
      }),
      catchError(error => {
        console.error('Error al comunicarse con el backend:', error);
        return throwError(() => new Error('Error al procesar la imagen. Por favor, intenta de nuevo.'));
      })
    );
  }
}
