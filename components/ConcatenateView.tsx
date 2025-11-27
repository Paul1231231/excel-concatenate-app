import React, { useState } from 'react';
import { FileWithId } from '../types';
import { Dropzone } from './Dropzone';
import { Button } from './ui/Button';
import { FileSpreadsheet, Trash2, ArrowDown } from 'lucide-react';
import { concatenateFiles } from '../services/excelService';

export const ConcatenateView: React.FC = () => {
  const [files, setFiles] = useState<FileWithId[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFilesDropped = (newFiles: File[]) => {
    const newFilesWithId = newFiles.map(f => ({
      id: Math.random().toString(36).substring(7),
      file: f,
      status: 'pending' as const
    }));
    setFiles(prev => [...prev, ...newFilesWithId]);
    setError(null);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleProcess = async () => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    setError(null);

    try {
      const rawFiles = files.map(f => f.file);
      const blob = await concatenateFiles(rawFiles);
      
      // Trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `merged_${new Date().toISOString().slice(0,10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred while processing files.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Upload Files to Merge</h2>
        <Dropzone onFilesDropped={handleFilesDropped} acceptMultiple={true} />
        
        {files.length > 0 && (
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between text-sm text-slate-500 pb-2 border-b border-slate-100">
              <span>Selected Files ({files.length})</span>
              <button onClick={() => setFiles([])} className="text-red-500 hover:text-red-600 hover:underline text-xs">Clear all</button>
            </div>
            
            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
              {files.map((fileItem, index) => (
                <div key={fileItem.id} className="relative group flex items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                   <div className="mr-3 text-slate-400">
                     <FileSpreadsheet className="w-5 h-5" />
                   </div>
                   <div className="flex-1 min-w-0">
                     <p className="text-sm font-medium text-slate-900 truncate">{fileItem.file.name}</p>
                     <p className="text-xs text-slate-500">{(fileItem.file.size / 1024).toFixed(1)} KB</p>
                   </div>
                   
                   {index < files.length - 1 && (
                     <div className="absolute -bottom-4 left-5 w-0.5 h-3 bg-slate-200 z-10" />
                   )}
                   
                   <button 
                     onClick={() => removeFile(fileItem.id)}
                     className="ml-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="flex justify-end">
        <Button 
          onClick={handleProcess} 
          disabled={files.length === 0}
          isLoading={isProcessing}
          className="w-full sm:w-auto"
        >
          Merge {files.length} Files
        </Button>
      </div>
    </div>
  );
};
