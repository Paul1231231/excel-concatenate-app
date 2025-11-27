import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { ProcessedSheet } from '../types';

// Constants based on user requirements
// Row 1 & 2 (index 0 & 1): Instructions
// Row 3 (index 2): Header
// Row 4+ (index 3+): Data
const HEADER_ROW_INDEX = 2; // 0-indexed
const DATA_START_INDEX = 3; // 0-indexed

export const readExcelFile = async (file: File): Promise<ProcessedSheet> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Assume we only care about the first sheet for simplicity, 
        // or we could merge all sheets. Let's start with the first sheet.
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to array of arrays
        const jsonData = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });

        if (jsonData.length <= HEADER_ROW_INDEX) {
           throw new Error("File is too short to contain required structure.");
        }

        const instructions = jsonData.slice(0, HEADER_ROW_INDEX);
        const header = jsonData[HEADER_ROW_INDEX];
        const rows = jsonData.slice(DATA_START_INDEX);

        resolve({
          name: file.name,
          instructions,
          header,
          data: rows
        });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
};

export const concatenateFiles = async (files: File[]): Promise<Blob> => {
  if (files.length === 0) throw new Error("No files provided");

  const processedSheets: ProcessedSheet[] = [];
  
  // Read all files
  for (const file of files) {
    const sheet = await readExcelFile(file);
    processedSheets.push(sheet);
  }

  // Master structure comes from the first file
  const master = processedSheets[0];
  let combinedData = [...master.data];

  // Append data from subsequent files
  for (let i = 1; i < processedSheets.length; i++) {
    // We assume columns align. If robust validation is needed, checks should go here.
    combinedData = combinedData.concat(processedSheets[i].data);
  }

  // Construct final array
  // Instructions (Rows 0-1) + Header (Row 2) + Data (Row 3...)
  const finalSheetData = [
    ...master.instructions,
    master.header,
    ...combinedData
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(finalSheetData);
  XLSX.utils.book_append_sheet(wb, ws, "Merged Data");

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([wbout], { type: 'application/octet-stream' });
};

export const splitFile = async (file: File, rowsPerFile: number): Promise<Blob> => {
  const sheet = await readExcelFile(file);
  const totalRows = sheet.data.length;
  const zip = new JSZip();

  let partCounter = 1;
  for (let i = 0; i < totalRows; i += rowsPerFile) {
    const chunkData = sheet.data.slice(i, i + rowsPerFile);
    
    // Reconstruct valid excel structure for this chunk
    const chunkSheetData = [
      ...sheet.instructions,
      sheet.header,
      ...chunkData
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(chunkSheetData);
    XLSX.utils.book_append_sheet(wb, ws, `Part ${partCounter}`);

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    
    // Original filename without extension
    const baseName = file.name.replace(/\.[^/.]+$/, "");
    zip.file(`${baseName}_part_${partCounter}.xlsx`, wbout);
    
    partCounter++;
  }

  return await zip.generateAsync({ type: 'blob' });
};
