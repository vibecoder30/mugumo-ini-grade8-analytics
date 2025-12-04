import { useCallback } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';
import { Student } from '@/lib/data-processing';
import { toast } from '@/hooks/use-toast';

interface FileUploadProps {
  onDataLoaded: (data: Student[]) => void;
}

export function FileUpload({ onDataLoaded }: FileUploadProps) {
  const handleFile = useCallback((file: File) => {
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file.",
        variant: "destructive"
      });
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          toast({
            title: "Error parsing CSV",
            description: "Could not parse the file correctly.",
            variant: "destructive"
          });
          return;
        }
        
        // Basic validation of columns
        const firstRow = results.data[0] as any;
        if (!firstRow || !('Name' in firstRow) || !('Mathematics' in firstRow)) {
          toast({
            title: "Invalid CSV Format",
            description: "File missing required columns (Name, Mathematics, etc).",
            variant: "destructive"
          });
          return;
        }

        onDataLoaded(results.data as Student[]);
        toast({
          title: "File Loaded",
          description: `Successfully loaded ${results.data.length} student records.`,
        });
      }
    });
  }, [onDataLoaded]);

  return (
    <div 
      className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer group"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
      }}
      onClick={() => document.getElementById('csv-upload')?.click()}
    >
      <input 
        type="file" 
        id="csv-upload" 
        className="hidden" 
        accept=".csv"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      <div className="bg-primary/10 text-primary p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
        <Upload className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
        Upload Grade 8 CSV
      </h3>
      <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto text-sm mb-6">
        Drag and drop your student data file here, or click to browse.
      </p>
      
      <div className="flex items-center justify-center gap-2 text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 py-2 px-4 rounded-md w-fit mx-auto">
        <FileText className="w-4 h-4" />
        <span>Supports standard grade8_suswa.csv format</span>
      </div>
    </div>
  );
}
