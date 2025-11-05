import React, { useState, useRef } from 'react';
import { API_BASE_URL } from '../../../../config/env';
import '../styles/ImageUploadInput.css';

interface ImageUploadInputProps {
  label: string;
  currentImageUrl?: string;
  onUploadSuccess: (newUrl: string) => void;
  uploadEndpoint: string;
  maxSizeMB?: number;
}

const ImageUploadInput: React.FC<ImageUploadInputProps> = ({
  label,
  currentImageUrl,
  onUploadSuccess,
  uploadEndpoint,
  maxSizeMB = 5
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploadSuccess(false);

    // Validar que sea imagen
    if (!file.type.startsWith('image/')) {
      setUploadError('El archivo debe ser una imagen (JPG, PNG, GIF, etc.)');
      return;
    }

    // Validar tamaño
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      setUploadError(
        `La imagen no debe superar ${maxSizeMB}MB. Tamaño actual: ${fileSizeMB.toFixed(2)}MB`
      );
      return;
    }

    // Guardar el archivo y crear preview local
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await fetch(`${API_BASE_URL}${uploadEndpoint}`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al subir la imagen');
      }

      const result = await response.json();

      // Éxito
      setUploadSuccess(true);
      onUploadSuccess(result.image_url);

      // Limpiar preview local y usar la URL del servidor
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(result.image_url);
      setSelectedFile(null);

      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setUploadSuccess(false);
      }, 3000);

    } catch (err) {
      console.error('Error uploading image:', err);
      setUploadError(err instanceof Error ? err.message : 'Error al subir la imagen');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePreview = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setSelectedFile(null);
    setUploadError(null);
    setUploadSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReplaceClick = () => {
    fileInputRef.current?.click();
  };

  // Función similar a getProxyImageUrl del módulo de emprendedores
  const getProxiedImageUrl = (url: string): string => {
    if (!url) return '';

    // Si es un objeto URL (archivo nuevo), devolverlo tal cual
    if (url.startsWith('blob:')) return url;

    // Si ya es una URL de proxy, devolverla tal cual
    if (url.includes('/images/proxy')) return url;

    // Si es una URL de Google Drive, usar el proxy
    if (url.includes('drive.google.com')) {
      return `${API_BASE_URL}/images/proxy?url=${encodeURIComponent(url)}`;
    }

    // Para otras URLs, devolver tal cual
    return url;
  };

  return (
    <div className="informative-image-upload">
      <label className="informative-image-upload__label">{label}</label>

      <div className="informative-image-upload__content">
        {/* Preview de la imagen */}
        {previewUrl && (
          <div className="informative-image-upload__preview-container">
            <img
              src={getProxiedImageUrl(previewUrl)}
              alt="Preview"
              className="informative-image-upload__preview-image"
            />
            <div className="informative-image-upload__preview-overlay">
              <button
                type="button"
                className="informative-image-upload__preview-btn informative-image-upload__preview-btn--replace"
                onClick={handleReplaceClick}
                disabled={isUploading}
                title="Cambiar imagen"
              >
                🔄 Cambiar
              </button>
              <button
                type="button"
                className="informative-image-upload__preview-btn informative-image-upload__preview-btn--delete"
                onClick={handleDeletePreview}
                disabled={isUploading}
                title="Eliminar imagen"
              >
                🗑️ Eliminar
              </button>
            </div>
          </div>
        )}

        {/* Input de archivo (oculto) */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="informative-image-upload__file-input"
          disabled={isUploading}
        />

        {/* Botones de acción */}
        <div className="informative-image-upload__actions">
          {!previewUrl && (
            <button
              type="button"
              onClick={handleReplaceClick}
              disabled={isUploading}
              className="informative-image-upload__select-btn"
            >
              📁 Seleccionar imagen
            </button>
          )}

          {selectedFile && !uploadSuccess && (
            <button
              type="button"
              onClick={handleUpload}
              disabled={isUploading}
              className={`informative-image-upload__upload-btn ${isUploading ? 'informative-image-upload__upload-btn--loading' : ''
                }`}
            >
              {isUploading ? (
                <>
                  <span className="informative-image-upload__spinner"></span>
                  Subiendo...
                </>
              ) : (
                <>⬆️ Subir imagen</>
              )}
            </button>
          )}
        </div>

        {/* Información de tamaño máximo */}
        <span className="informative-image-upload__hint">
          📏 Tamaño máximo: {maxSizeMB}MB | Formatos: JPG, PNG, GIF, WebP
        </span>
      </div>

      {/* Mensajes de éxito */}
      {uploadSuccess && (
        <div className="informative-image-upload__success">
          ✅ Imagen subida exitosamente
        </div>
      )}

      {/* Mensajes de error */}
      {uploadError && (
        <div className="informative-image-upload__error">
          ⚠️ {uploadError}
        </div>
      )}
    </div>
  );
};

export default ImageUploadInput;