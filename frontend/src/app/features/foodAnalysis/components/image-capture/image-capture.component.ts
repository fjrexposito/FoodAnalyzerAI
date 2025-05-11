import { Component, EventEmitter, Output, signal, WritableSignal, ViewChild, ElementRef, OnDestroy, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image-capture',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-capture.component.html',
  styleUrls: ['./image-capture.component.scss'],
  host: { 'class': 'app-image-capture d-block' } // Tu configuración de host
})
export class ImageCaptureComponent implements OnDestroy {
  @Output() imageSelected = new EventEmitter<File>();

  public previewUrl: WritableSignal<string | null | ArrayBuffer> = signal(null);
  public selectedFileName: WritableSignal<string | null> = signal(null);

  // Nuevos signals para el estado de la cámara
  public isCameraActive: WritableSignal<boolean> = signal(false);
  public cameraError: WritableSignal<string | null> = signal(null);

  // Referencias a los elementos del DOM que añadiremos/usaremos en tu HTML
  @ViewChild('videoElement') videoElement?: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement?: ElementRef<HTMLCanvasElement>;

  private stream: MediaStream | null = null;

  constructor() { }

  onFileSelected(event: Event): void {
    this.cancelCameraIfNeeded(); // Si la cámara estaba activa, la cerramos
    this.cameraError.set(null);

    const element = event.currentTarget as HTMLInputElement;
    const fileList: FileList | null = element.files;

    if (fileList && fileList[0]) {
      const file = fileList[0];
      this.selectedFileName.set(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl.set(reader.result);
      };
      reader.readAsDataURL(file);
      this.imageSelected.emit(file);
    } else {
      this.clearSelectionInternal();
    }
  }

  async startCamera(): Promise<void> {
    this.clearSelectionInternal();
    this.cameraError.set(null);

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        this.isCameraActive.set(true);

        // Usamos un pequeño timeout para asegurar que el DOM se actualice con @if(isCameraActive())
        // antes de intentar acceder a this.videoElement.nativeElement
        setTimeout(() => {
          if (this.videoElement?.nativeElement && this.stream) {
            this.videoElement.nativeElement.srcObject = this.stream;
            this.videoElement.nativeElement.onloadedmetadata = () => {
              this.videoElement?.nativeElement?.play().catch(err => {
                console.error("Error al reproducir video:", err);
                this.cameraError.set('No se pudo iniciar la reproducción de la cámara.');
                this.stopCameraStream();
                this.isCameraActive.set(false);
              });
            };
          } else {
            console.warn('Elemento de video no encontrado tras activar la cámara.');
            this.cameraError.set('No se pudo preparar el visor de la cámara.');
            this.stopCameraStream(); // Limpiar si el elemento no está
            this.isCameraActive.set(false);
          }
        }, 0);

      } catch (err: any) {
        console.error("Error al acceder a la cámara: ", err);
        let message = 'No se pudo acceder a la cámara.';
        if (err.name === "NotAllowedError") message = 'Permiso para acceder a la cámara denegado.';
        else if (err.name === "NotFoundError") message = 'No se encontró una cámara compatible.';
        else if (err.name === "NotReadableError") message = 'La cámara está siendo utilizada por otra aplicación.';
        this.cameraError.set(message);
        this.isCameraActive.set(false);
        this.stopCameraStream();
      }
    } else {
      this.cameraError.set('La API de cámara no está soportada por este navegador.');
      this.isCameraActive.set(false);
    }
  }

  captureImage(): void {
    if (this.videoElement?.nativeElement && this.canvasElement?.nativeElement && this.stream) {
      const video = this.videoElement.nativeElement;
      const canvas = this.canvasElement.nativeElement;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');

      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(blob => {
          if (blob) {
            const timestamp = new Date().toISOString().replace(/[-:.]/g, "");
            const fileName = `captura_${timestamp}.jpg`;
            const capturedFile = new File([blob], fileName, { type: 'image/jpeg' });

            this.selectedFileName.set(fileName);
            this.previewUrl.set(canvas.toDataURL('image/jpeg'));
            this.imageSelected.emit(capturedFile);
          }
          this.stopCameraStream();
          this.isCameraActive.set(false);
        }, 'image/jpeg', 0.9);
      } else {
        this.cameraError.set('Error al obtener contexto del canvas para captura.');
        this.stopCameraStream();
        this.isCameraActive.set(false);
      }
    } else {
      this.cameraError.set('Elementos de video/canvas no listos para captura.');
      this.stopCameraStream(); // Asegurarse de detener si algo falla
      this.isCameraActive.set(false);
    }
  }

  stopCameraStream(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.videoElement?.nativeElement) {
      this.videoElement.nativeElement.srcObject = null;
    }
  }

  cancelCamera(): void {
    this.stopCameraStream();
    this.isCameraActive.set(false);
    this.cameraError.set(null); // Limpiar errores al cancelar explícitamente
  }

  private cancelCameraIfNeeded(): void {
    if (this.isCameraActive()) {
      this.cancelCamera();
    }
  }

  private clearSelectionInternal(): void {
    this.previewUrl.set(null);
    this.selectedFileName.set(null);
  }

  clearSelection(): void {
    this.clearSelectionInternal();
    this.cancelCameraIfNeeded(); // Si la cámara estaba activa, la cancelamos
    this.imageSelected.emit(undefined);
    const fileInput = document.getElementById('imageFile') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  ngOnDestroy(): void {
    this.stopCameraStream();
  }
}
