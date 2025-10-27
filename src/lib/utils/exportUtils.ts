/**
 * Export Utility Functions
 * 
 * Shared utility functions for exporting data in various formats.
 * Used in analytics pages to download survey data.
 */

import { createLogger } from '@/lib/logger';

const logger = createLogger('ExportUtils');

/**
 * Exports data to CSV format and triggers download
 * 
 * @param data - Array of objects to export
 * @param filename - Name of the downloaded file (without extension)
 * @param headers - Optional custom headers. If not provided, uses object keys
 * 
 * @example
 * exportToCSV(
 *   [{ name: 'John', age: 30 }, { name: 'Jane', age: 25 }],
 *   'users',
 *   ['Name', 'Age']
 * )
 */
export function exportToCSV(
  data: Record<string, any>[],
  filename: string,
  headers?: string[]
): void {
  if (data.length === 0) {
    logger.warn('No data to export');
    return;
  }

  try {
    // Use provided headers or extract from first object
    const csvHeaders = headers || Object.keys(data[0]);
    
    // Build CSV rows
    const rows = data.map((item) => {
      return csvHeaders.map((header) => {
        const value = item[header] || '';
        const stringValue = String(value);
        
        // Escape quotes and wrap in quotes if contains comma or quote
        if (stringValue.includes(',') || stringValue.includes('"')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      });
    });

    // Combine headers and rows
    const csv = [csvHeaders.join(','), ...rows.map((row) => row.join(','))].join('\n');

    // Trigger download
    downloadFile(csv, `${filename}.csv`, 'text/csv');
    
    logger.info('CSV export successful', { filename, rowCount: data.length });
  } catch (error) {
    logger.error('CSV export failed', error);
    throw error;
  }
}

/**
 * Exports data to JSON format and triggers download
 * 
 * @param data - Data to export (object or array)
 * @param filename - Name of the downloaded file (without extension)
 * @param prettyPrint - Whether to format JSON with indentation (default: true)
 * 
 * @example
 * exportToJSON(
 *   { users: [{ name: 'John' }], total: 1 },
 *   'users-data'
 * )
 */
export function exportToJSON(
  data: any,
  filename: string,
  prettyPrint: boolean = true
): void {
  try {
    const json = JSON.stringify(data, null, prettyPrint ? 2 : 0);
    
    // Trigger download
    downloadFile(json, `${filename}.json`, 'application/json');
    
    logger.info('JSON export successful', { filename });
  } catch (error) {
    logger.error('JSON export failed', error);
    throw error;
  }
}

/**
 * Internal helper to trigger file download
 * Creates a temporary anchor element and clicks it
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  
  // Cleanup
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Formats survey analytics data for CSV export
 * Specialized helper for survey response exports
 */
export function formatSurveyDataForCSV(
  responses: any[],
  questions: any[]
): Record<string, any>[] {
  return responses.map((response) => {
    const answers = response.answers as Record<string, string>;
    
    const row: Record<string, any> = {
      'Response ID': response.id,
      'Timestamp': new Date(response.created_at).toISOString(),
      'Sentiment': response.sentiment || 'Not Analyzed',
    };

    // Add question answers
    questions.forEach((question) => {
      row[question.question] = answers[question.id.toString()] || '';
    });

    return row;
  });
}

