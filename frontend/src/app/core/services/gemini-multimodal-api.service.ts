import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, from } from 'rxjs';
import { switchMap, map, catchError, tap, delay } from 'rxjs/operators';
import { FoodAnalysis } from '../../features/foodAnalysis/models/food-analysis.interface';
import { BackendApiService } from './backend-api.service';

@Injectable({
  providedIn: 'root'
})
export class GeminiMultimodalApiService {
  // Comentamos las variables de la API real
  // private apiKey = environment.geminiApiKey;
  // private apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`;

  constructor(private http: HttpClient) {
    // Comentamos la advertencia de la API key
    // if (!this.apiKey) {
    //   console.error('¡ALERTA! La API Key de Gemini no está configurada en environment.ts. Las llamadas a la API fallarán.');
    // }
  }

  /*
  // Función auxiliar para convertir File a Base64 string (sin data URL prefix)
  private async imageToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = error => reject(error);
    });
  }
  */

  analyzeImage(imageData: File | string): Observable<FoodAnalysis | null> {
    console.log('GeminiMultimodalApiService: analyzeImage llamado (delegando al BackendApiService):', imageData);

    // Para mantener la compatibilidad, verificamos que sea un archivo
    if (!(imageData instanceof File)) {
      console.error('Tipo de imagen no soportado o no es un archivo. Se espera un objeto File.');
      return of(null);
    }

    // Crear una instancia del servicio BackendApi e inyectar el HttpClient
    const backendService = new BackendApiService(this.http);

    // Delegamos al servicio de backend
    return backendService.analyzeImage(imageData as File).pipe(
      tap(response => {
        console.log('Respuesta del backend:', response);
      }),
      catchError(error => {
        console.error('Error al analizar la imagen con el backend:', error);

        // En caso de error, fallback a los datos mock
        console.log('Fallback a datos mock...');
        return this.http.get<FoodAnalysis>('../../../assets/mocks/food-analysis.mock.json').pipe(
          tap(mockData => {
            console.log('Datos mock cargados como fallback:', mockData);
          }),
          delay(1000)
        );
      })
    );

    /*
    // --- LÓGICA DE LA LLAMADA REAL A GEMINI API (Comentada) ---

    if (!(imageData instanceof File)) {
      console.error('Tipo de imagen no soportado o no es un archivo. Se espera un objeto File.');
      return of(null);
    }

    const imageFile = imageData as File;

    const prompt = `
Analiza la imagen del alimento proporcionada. Basándote en la imagen, proporciona la siguiente información en formato JSON.
El objeto JSON principal debe tener las siguientes claves (usa null o arrays vacíos si la información no está disponible o no aplica):
- "healthRating": Una cadena de texto entre "Saludable", "Aceptable", "Poco Saludable", "No Saludable".
// ... (resto del prompt detallado que teníamos) ...
Por favor, asegúrate de que la respuesta sea únicamente el objeto JSON válido.
    `;

    return from(this.imageToBase64(imageFile)).pipe(
      switchMap(base64ImageData => {
        const requestBody = {
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: imageFile.type,
                    data: base64ImageData
                  }
                }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: "application/json"
          }
        };

        const headers = new HttpHeaders({
          'Content-Type': 'application/json'
        });

        // Usamos <any> para la respuesta por ahora
        return this.http.post<any>(this.apiUrl, requestBody, { headers });
      }),
      tap(response => {
        console.log('Respuesta COMPLETA de Gemini API:', response);
      }),
      map(response => {
        if (response && response.candidates && response.candidates.length > 0 &&
            response.candidates[0].content && response.candidates[0].content.parts &&
            response.candidates[0].content.parts.length > 0 && response.candidates[0].content.parts[0].text) {
          try {
            const jsonText = response.candidates[0].content.parts[0].text;
            const parsedJson = JSON.parse(jsonText);
            return parsedJson as FoodAnalysis;
          } catch (error) {
            console.error('Error al parsear JSON de la respuesta de Gemini:', error, response.candidates[0].content.parts[0].text);
            return null;
          }
        } else {
          console.warn('La respuesta de Gemini no tuvo el formato esperado o estaba vacía.', response);
          return null;
        }
      }),
      catchError(error => {
        console.error('Error en la llamada a Gemini API:', error);
        return of(null);
      })
    );
    */
  }
}
