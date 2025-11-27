import React, { useState } from 'react';
import { AppMode } from './types';
import { ConcatenateView } from './components/ConcatenateView';
import { SplitView } from './components/SplitView';
import { Layers, Scissors, Sheet } from 'lucide-react';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.CONCATENATE);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-600/20">
              <Sheet className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
              Excel Forge
            </h1>
          </div>
          <div className="text-sm text-slate-500 hidden sm:block">
            Secure, client-side processing
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Intro */}
        <div className="mb-8 text-center sm:text-left">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Manage your datasets</h2>
          <p className="text-slate-600 max-w-2xl">
            Easily merge multiple Excel files into one master sheet, or split large datasets into manageable chunks—all while preserving your custom headers and instruction rows.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start mb-8 space-y-4 sm:space-y-0 sm:space-x-4">
          <button
            onClick={() => setMode(AppMode.CONCATENATE)}
            className={`
              flex items-center px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 w-full sm:w-auto justify-center
              ${mode === AppMode.CONCATENATE 
                ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200' 
                : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
              }
            `}
          >
            <Layers className={`w-4 h-4 mr-2 ${mode === AppMode.CONCATENATE ? 'text-blue-600' : 'text-slate-400'}`} />
            Concatenate
          </button>
          
          <button
            onClick={() => setMode(AppMode.SPLIT)}
            className={`
              flex items-center px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 w-full sm:w-auto justify-center
              ${mode === AppMode.SPLIT 
                ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200' 
                : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
              }
            `}
          >
            <Scissors className={`w-4 h-4 mr-2 ${mode === AppMode.SPLIT ? 'text-blue-600' : 'text-slate-400'}`} />
            Split
          </button>
        </div>

        {/* Views */}
        <div className="relative min-h-[400px]">
          {mode === AppMode.CONCATENATE ? <ConcatenateView /> : <SplitView />}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="mt-20 border-t border-slate-200 py-8 bg-white">
         <div className="max-w-5xl mx-auto px-4 text-center text-sm text-slate-400">
           <p>© {new Date().getFullYear()} Excel Forge. All processing happens in your browser.</p>
         </div>
      </footer>
    </div>
  );
};

export default App;