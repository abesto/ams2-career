/* --- STATE --- */
export interface ExportReminderState {
  lastExport: number | null; // JS timestamp
  hideAlertForever: boolean;
}
