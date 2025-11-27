import React, { useState } from 'react';
import { Dropzone } from './Dropzone';
import { Button } from './ui/Button';
import { FileSpreadsheet, Trash2, Scissors, Download, AlertCircle } from 'lucide-react';
import { splitFile } from '../services/excelService';

export const SplitView: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [rowsPerFile, setRowsPerFile] = useState<number>(1000);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileDropped = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setError(null);
    }
  };

  const handleProcess = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    setError(null);

    try {
      const blob = await splitFile(file, rowsPerFile);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${file.name.replace(/\.[^/.]+$/, "")}_split.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred while splitting the file.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Select File to Split</h2>
        
        {!file ? (
          <Dropzone onFilesDropped={handleFileDropped} acceptMultiple={false} />
        ) : (
          <div className="flex items-center p-4 bg-blue-50 border border-blue-100 rounded-xl">
             <div className="p-2 bg-blue-100 text-blue-600 rounded-lg mr-4">
               <FileSpreadsheet className="w-6 h-6" />
             </div>
             <div className="flex-1 min-w-0">
               <p className="text-sm font-semibold text-slate-900 truncate">{file.name}</p>
               <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
             </div>
             <button 
               onClick={() => setFile(null)}
               className="p-2 text-slate-400 hover:text-red-500 hover:bg-white rounded-lg transition-colors"
             >
               <Trash2 className="w-5 h-5" />
             </button>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-slate-100">
          <h3 className="text-sm font-medium text-slate-900 mb-4 flex items-center">
            <Scissors className="w-4 h-4 mr-2 text-slate-500" />
            Split Configuration
          </h3>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="rows" className="block text-sm text-slate-600 mb-2">
                Rows per file
              </label>
              <input
                id="rows"
                type="number"
                min="1"
                value={rowsPerFile}
                onChange={(e) => setRowsPerFile(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <p className="mt-1 text-xs text-slate-400">
                Each output file will have {rowsPerFile} data rows plus the header and instructions.
              </p>
            </div>
            
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-100 flex items-start">
              <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-xs text-amber-800">
                <p className="font-medium mb-1">Structure Preservation</p>
                The first 3 rows (Instructions + Header) will be duplicated in every split file.
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="flex justify-end">
        <Button 
          onClick={handleProcess} 
          disabled={!file}
          isLoading={isProcessing}
          className="w-full sm:w-auto"
        >
          <Download className="w-4 h-4 mr-2" />
          Split & Download Zip
        </Button>
      </div>
    </div>
  );
};
