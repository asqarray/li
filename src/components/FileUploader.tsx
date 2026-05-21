import React, { useCallback, useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { FileData } from '../types';

interface Props {
  files: FileData[];
  onFilesChange: React.Dispatch<React.SetStateAction<FileData[]>>;
}

export default function FileUploader({ files, onFilesChange }: Props) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const newFile: FileData = {
        name: file.name,
        type: file.type,
        content: content
      };
      onFilesChange(prev => [...prev, newFile]);
    };
    reader.readAsText(file);
  }, [onFilesChange]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    droppedFiles.forEach(handleFile);
  };

  const removeFile = (index: number) => {
    onFilesChange(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div
        id="drop-zone"
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => document.getElementById('file-input')?.click()}
        className={`p-4 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all ${
          isDragging 
            ? 'border-cyan-500 bg-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.2)]' 
            : 'border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
        }`}
      >
        <Upload className={`w-6 h-6 mb-2 transition-colors ${isDragging ? 'text-cyan-400' : 'text-slate-500'}`} />
        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Inject Data Feed</span>
        <input
          id="file-input"
          type="file"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && Array.from(e.target.files).forEach(handleFile)}
        />
      </div>

      {files.length > 0 && (
        <div className="flex flex-col gap-1">
          {files.map((file, i) => (
            <div key={i} className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2 overflow-hidden">
                <FileText className="w-3 h-3 text-cyan-500 shrink-0" />
                <span className="theme-mono text-[10px] truncate italic text-slate-400">[●] {file.name}</span>
              </div>
              <button
                id={`remove-file-${i}`}
                onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                className="text-slate-600 hover:text-red-500 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
