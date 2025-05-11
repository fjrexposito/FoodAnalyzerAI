import { Component, EventEmitter, Output, signal, WritableSignal, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image-capture',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-capture.component.html',
  styleUrls: ['./image-capture.component.scss'],
  host: { 'class': 'app-image-capture d-block' }
})
export class ImageCaptureComponent {
  // Output para emitir el archivo de imagen seleccionado o la cadena base64
  @Output() imageSelected = new EventEmitter<File>();

  // Signal para la URL de previsualización de la imagen
  public previewUrl: WritableSignal<string | null | ArrayBuffer> = signal(null);
  public selectedFileName: WritableSignal<string | null> = signal(null);

  constructor() { }

  // Manejador para cuando se selecciona un archivo a través del input
  onFileSelected(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    const fileList: FileList | null = element.files;

    if (fileList && fileList[0]) {
      const file = fileList[0];
      this.selectedFileName.set(file.name);

      // Generar URL para previsualización
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl.set(reader.result);
      };
      reader.readAsDataURL(file);

      // Emitir el archivo seleccionado
      this.imageSelected.emit(file);
    } else {
      this.previewUrl.set(null);
      this.selectedFileName.set(null);
    }
  }

  // Método para activar la cámara (implementación básica conceptual)
  // La implementación real de la cámara puede ser más compleja y requerir manejo de permisos, etc.
  async onOpenCamera(): Promise<void> {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        // Aquí necesitarías un elemento <video> en tu plantilla para mostrar el stream
        // y un <canvas> para capturar el frame.
        // Es una implementación más avanzada que dejamos pendiente por ahora para simplificar.
        console.log('Acceso a la cámara permitido. Stream:', stream);
        alert('Funcionalidad de cámara aún no implementada completamente. Por favor, selecciona un archivo.');
        // Lógica para mostrar el stream en un elemento <video> y capturar un frame.
        // Cuando se capture un frame, se convertiría a File y se emitiría.
        // Por ejemplo: const capturedFile = await this.captureFrameFromStream(stream);
        // this.previewUrl.set(URL.createObjectURL(capturedFile));
        // this.selectedFileName.set('captura_camara.jpg');
        // this.imageSelected.emit(capturedFile);

        // No olvides detener el stream cuando ya no se necesite:
        // stream.getTracks().forEach(track => track.stop());

      } catch (err) {
        console.error("Error al acceder a la cámara: ", err);
        alert('No se pudo acceder a la cámara. Asegúrate de haber concedido los permisos.');
        this.previewUrl.set(null);
        this.selectedFileName.set(null);
      }
    } else {
      alert('La API de cámara no está soportada por este navegador.');
      this.previewUrl.set(null);
      this.selectedFileName.set(null);
    }
  }

  // (Opcional) Método para limpiar la selección
  clearSelection(): void {
    this.previewUrl.set(null);
    this.selectedFileName.set(null);
    this.imageSelected.emit(undefined); // O emitir null, según prefieras manejarlo en el padre
    // Si tienes un input file, podrías necesitar resetearlo:
    // const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    // if (fileInput) fileInput.value = '';
  }
}
