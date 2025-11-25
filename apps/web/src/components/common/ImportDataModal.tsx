import { useState, useRef } from "react";
import { Button } from "@flatflow/ui";
import { ExportedData, validateImportedData, importData, parseImportFile } from "../../lib/dataExport";
import { useToast } from "../../hooks";

interface ImportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ImportDataModal({ isOpen, onClose }: ImportDataModalProps) {
  const { success, error } = useToast();
  const [_file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<ExportedData | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mergeMode, setMergeMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setValidationError(null);
    setPreviewData(null);
    setIsLoading(true);

    try {
      const data = await parseImportFile(selectedFile);
      const validation = validateImportedData(data);

      if (!validation.valid) {
        setValidationError(validation.error || "Invalid data");
        setIsLoading(false);
        return;
      }

      setPreviewData(data);
    } catch (err) {
      setValidationError(err instanceof Error ? err.message : "Failed to read file");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = () => {
    if (!previewData) return;

    try {
      importData(previewData, { merge: mergeMode });
      success(mergeMode ? "Data merged successfully" : "Data imported successfully");
      handleClose();
    } catch (err) {
      error("Failed to import data");
      console.error("Import error:", err);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreviewData(null);
    setValidationError(null);
    setMergeMode(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <input
        type="checkbox"
        id="import-data-modal"
        className="modal-toggle"
        checked={isOpen}
        onChange={() => {}}
      />
      <div className={`modal ${isOpen ? "modal-open" : ""}`} role="dialog">
        <div className="modal-box max-w-2xl">
          <h3 className="font-bold text-lg mb-4">Import Data</h3>

          {/* File Selection */}
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text font-medium">Select Export File</span>
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="file-input file-input-bordered w-full"
              onChange={handleFileSelect}
              disabled={isLoading}
            />
            {isLoading && (
              <span className="label-text-alt text-base-content/60 mt-1">
                Reading file...
              </span>
            )}
          </div>

          {/* Validation Error */}
          {validationError && (
            <div className="alert alert-error mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm">{validationError}</span>
            </div>
          )}

          {/* Preview */}
          {previewData && (
            <div className="space-y-4 mb-4">
              <div className="alert alert-info">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="stroke-current shrink-0 h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <h4 className="font-bold">File validated successfully!</h4>
                  <div className="text-sm mt-1">
                    <p>Version: {previewData.version}</p>
                    <p>
                      Exported:{" "}
                      {previewData.exportedAt
                        ? new Date(previewData.exportedAt).toLocaleString("en-IN")
                        : "Unknown"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="card bg-base-200">
                <div className="card-body p-4">
                  <h4 className="font-semibold mb-3">Data Preview</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium">Members:</span>{" "}
                      {previewData.members?.length || 0}
                    </div>
                    <div>
                      <span className="font-medium">Bills:</span>{" "}
                      {previewData.bills?.length || 0}
                    </div>
                    <div>
                      <span className="font-medium">Expenses:</span>{" "}
                      {previewData.expenses?.length || 0}
                    </div>
                    <div>
                      <span className="font-medium">Settlements:</span>{" "}
                      {previewData.settlements?.length || 0}
                    </div>
                    <div>
                      <span className="font-medium">Bill Payments:</span>{" "}
                      {previewData.billPayments?.length || 0}
                    </div>
                    <div>
                      <span className="font-medium">Flat:</span>{" "}
                      {previewData.flat ? "Yes" : "No"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Merge Mode Toggle */}
              <div className="form-control">
                <label className="label cursor-pointer">
                  <div>
                    <span className="label-text font-medium">Merge with existing data</span>
                    <p className="text-sm text-base-content/60">
                      If enabled, imported data will be merged with existing data. If disabled, all
                      existing data will be replaced.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={mergeMode}
                    onChange={(e) => setMergeMode(e.target.checked)}
                  />
                </label>
              </div>

              {!mergeMode && (
                <div className="alert alert-warning">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="stroke-current shrink-0 h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <span className="text-sm">
                    Warning: This will replace all existing data. Make sure you have exported your
                    current data as a backup.
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="modal-action">
            <Button type="button" variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleImport}
              disabled={!previewData || isLoading}
            >
              {mergeMode ? "Merge Data" : "Import Data"}
            </Button>
          </div>
        </div>
        <label className="modal-backdrop" onClick={handleClose}></label>
      </div>
    </>
  );
}

