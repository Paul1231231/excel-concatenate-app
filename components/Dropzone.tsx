import React, { useCallback, useState } from 'react';
import { UploadCloud, FileSpreadsheet, X } from 'lucide-react';

interface DropzoneProps {
  onFilesDropped: (files: File[]) => void;
  acceptMultiple?: boolean;
}

export const Dropzone: React.FC<DropzoneProps> = ({ onFilesDropped, acceptMultiple = true }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = (Array.from(e.dataTransfer.files) as File[]).filter(file => 
      file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv')
    );
    
    if (droppedFiles.length > 0) {
      if (!acceptMultiple) {
        onFilesDropped([droppedFiles[0]]);
      } else {
        onFilesDropped(droppedFiles);
      }
    }
  }, [acceptMultiple, onFilesDropped]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files) as File[];
      if (!acceptMultiple) {
        onFilesDropped([selectedFiles[0]]);
      } else {
        onFilesDropped(selectedFiles);
      }
    }
  }, [acceptMultiple, onFilesDropped]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ease-in-out cursor-pointer group
        ${isDragging 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
        }
      `}
      onClick={() => document.getElementById('file-input')?.click()}
    >
      <input
        id="file-input"
        type="file"
        className="hidden"
        multiple={acceptMultiple}
        accept=".xlsx,.xls,.csv"
        onChange={handleFileInput}
      />
      
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className={`
          p-3 rounded-full 
          ${isDragging ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}
        `}>
          <UploadCloud className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-900">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-slate-500">
            Excel files (.xlsx) supported
          </p>
        </div>
      </div>
    </div>
  );
};