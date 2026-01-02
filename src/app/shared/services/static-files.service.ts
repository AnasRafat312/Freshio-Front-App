import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';

/**
 * Generic Static Files Service
 * Serves files from any API without CORS issues
 */
@Injectable({
  providedIn: 'root'
})
export class StaticFilesService {
  
  constructor(private http: HttpClient) { }

  /**
   * Get file from any API
   * @param apiBaseUrl - Base URL of the API (e.g., 'https://localhost:44382')
   * @param filePath - Relative path to file (e.g., 'Uploads/ProfilePictures/image.png')
   * @returns Observable<Blob>
   * 
   * @example
   * this.staticFilesService.getFile('https://localhost:44382', 'Uploads/ProfilePictures/logo.png')
   */
  getFile(apiBaseUrl: string, filePath: string): Observable<Blob> {
    // Remove trailing slash from API URL
    apiBaseUrl = apiBaseUrl.replace(/\/$/, '');
    
    // Remove leading slash from file path
    filePath = filePath.replace(/^\//, '');
    
    // Construct full URL
    const url = `${apiBaseUrl}/StaticFiles/${filePath}`;
    //const url = `${apiBaseUrl}/api/StaticFiles/GetFile?path=${encodeURIComponent(filePath)}`;

    
    return this.http.get(url, { responseType: 'blob' });
  }

  /**
   * Get file as base64 string (useful for PDFs, images in canvas, etc.)
   * @param apiBaseUrl - Base URL of the API
   * @param filePath - Relative path to file
   * @returns Promise<string> - Base64 encoded file
   * 
   * @example
   * const base64 = await this.staticFilesService.getFileAsBase64(
   *   'https://localhost:44382', 
   *   'Uploads/ProfilePictures/logo.png'
   * );
   */
  async getFileAsBase64(apiBaseUrl: string, filePath: string): Promise<string> {
    const blob = await firstValueFrom(this.getFile(apiBaseUrl, filePath));
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Get file URL for direct use in <img> tags or <a> download links
   * @param apiBaseUrl - Base URL of the API
   * @param filePath - Relative path to file
   * @returns string - Full URL to the file
   * 
   * @example
   * // In component
   * this.imageUrl = this.staticFilesService.getFileUrl(
   *   'https://localhost:44382', 
   *   'Uploads/ProfilePictures/logo.png'
   * );
   * 
   * // In template
   * <img [src]="imageUrl" alt="Logo" />
   */
  getFileUrl(apiBaseUrl: string, filePath: string): string {
    apiBaseUrl = apiBaseUrl.replace(/\/$/, '');
    filePath = filePath.replace(/^\//, '');
    return `${apiBaseUrl}/api/StaticFiles/GetFile?path=${encodeURIComponent(filePath)}`;
  }

  /**
   * Download file with custom filename
   * @param apiBaseUrl - Base URL of the API
   * @param filePath - Relative path to file
   * @param downloadFilename - Optional custom filename for download
   * 
   * @example
   * this.staticFilesService.downloadFile(
   *   'https://localhost:44385',
   *   'Uploads/Documents/report.pdf',
   *   'Monthly-Report-2024.pdf'
   * );
   */
  async downloadFile(apiBaseUrl: string, filePath: string, downloadFilename?: string): Promise<void> {
    try {
      const blob = await firstValueFrom(this.getFile(apiBaseUrl, filePath));
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = downloadFilename || filePath.split('/').pop() || 'download';
      link.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  }

  /**
   * Check if file exists
   * @param apiBaseUrl - Base URL of the API
   * @param filePath - Relative path to file
   * @returns Promise<boolean>
   * 
   * @example
   * const exists = await this.staticFilesService.fileExists(
   *   'https://localhost:44382',
   *   'Uploads/ProfilePictures/user123.jpg'
   * );
   */
  async fileExists(apiBaseUrl: string, filePath: string): Promise<boolean> {
    try {
      await firstValueFrom(this.getFile(apiBaseUrl, filePath));
      return true;
    } catch (error) {
      return false;
    }
  }
}
