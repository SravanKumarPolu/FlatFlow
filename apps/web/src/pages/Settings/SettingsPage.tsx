import { useState } from "react";
import { PageHeader, FlatSettingsModal, ConfirmDeleteModal, ImportDataModal, NotificationSettingsModal, ImpulseControlSettingsModal } from "../../components/common";
import { Card, Button } from "@flatflow/ui";
import { APP_NAME, getAppVersionString, BUILD_ENV } from "../../config/appInfo";
import { useFlat, useToast } from "../../hooks";
import { downloadExportedData, resetAllData } from "../../lib/dataExport";

export default function SettingsPage() {
  const { currentFlat } = useFlat();
  const { success, error } = useToast();
  const [isFlatModalOpen, setIsFlatModalOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isNotificationSettingsOpen, setIsNotificationSettingsOpen] = useState(false);
  const [isImpulseControlSettingsOpen, setIsImpulseControlSettingsOpen] = useState(false);

  const handleExportData = () => {
    try {
      downloadExportedData();
      success("Data exported successfully");
    } catch (err) {
      error("Failed to export data");
      console.error("Export error:", err);
    }
  };

  const handleResetData = () => {
    try {
      resetAllData();
      success("All data has been reset");
      setIsResetConfirmOpen(false);
    } catch (err) {
      error("Failed to reset data");
      console.error("Reset error:", err);
    }
  };

  return (
    <>
      <PageHeader title="Settings" />

      <div className="space-y-6">
        {/* Appearance */}
        <Card variant="bordered">
          <div className="card-body">
            <h2 className="card-title text-lg mb-4">Appearance</h2>
            <div className="space-y-4">
              <div className="form-control">
                <label className="label cursor-pointer">
                  <div>
                    <span className="label-text font-medium">Dark Mode</span>
                    <p className="text-sm text-base-content/60">
                      Switch between light and dark themes
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    onChange={(e) => {
                      const theme = e.target.checked ? "dark" : "flatflow";
                      document.documentElement.setAttribute("data-theme", theme);
                    }}
                  />
                </label>
              </div>
            </div>
          </div>
        </Card>

        {/* Flat Settings */}
        <Card variant="bordered">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h2 className="card-title text-lg">Flat Settings</h2>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsFlatModalOpen(true)}
              >
                {currentFlat ? "Edit" : "Create"} Flat
              </Button>
            </div>
            {currentFlat ? (
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-base-content/60">Flat Name</span>
                  <p className="text-lg font-semibold">{currentFlat.name}</p>
                </div>
                {currentFlat.city && (
                  <div>
                    <span className="text-sm font-medium text-base-content/60">City</span>
                    <p className="text-lg">{currentFlat.city}</p>
                  </div>
                )}
                <div>
                  <span className="text-sm font-medium text-base-content/60">Billing Cycle</span>
                  <p className="text-lg">
                    {currentFlat.billingCycleStartDay}
                    {currentFlat.billingCycleStartDay === 1
                      ? "st"
                      : currentFlat.billingCycleStartDay === 2
                      ? "nd"
                      : currentFlat.billingCycleStartDay === 3
                      ? "rd"
                      : "th"}{" "}
                    of each month
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-base-content/60">Currency</span>
                  <p className="text-lg">{currentFlat.currency}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-base-content/60 mb-4">
                  No flat configured yet. Create one to get started!
                </p>
                <Button
                  variant="primary"
                  onClick={() => setIsFlatModalOpen(true)}
                >
                  Create Your First Flat
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Data & Privacy */}
        <Card variant="bordered">
          <div className="card-body">
            <h2 className="card-title text-lg mb-4">Data & Privacy</h2>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleExportData}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Export Data
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setIsImportModalOpen(true)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                Import Data
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-error"
                onClick={() => setIsResetConfirmOpen(true)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Reset All Data
              </Button>
            </div>
          </div>
        </Card>

        {/* Impulse Control */}
        <Card variant="bordered">
          <div className="card-body">
            <h2 className="card-title text-lg mb-4">Impulse Control</h2>
            <p className="text-sm text-base-content/60 mb-4">
              Set spending limits to get nudged when you're about to exceed them.
            </p>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setIsImpulseControlSettingsOpen(true)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              Configure Spending Limits
            </Button>
          </div>
        </Card>

        {/* About */}
        <Card variant="bordered">
          <div className="card-body">
            <h2 className="card-title text-lg mb-4">About</h2>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">App:</span> {APP_NAME}
              </p>
              <p>
                <span className="font-medium">Version:</span> {getAppVersionString()}
              </p>
              <p>
                <span className="font-medium">Environment:</span>{" "}
                <span className="badge badge-sm badge-outline">{BUILD_ENV}</span>
              </p>
              <p className="text-base-content/60 mt-4">
                FlatFlow helps you manage shared expenses and bills with your flatmates.
              </p>
            </div>
          </div>
        </Card>
      </div>

      <FlatSettingsModal
        isOpen={isFlatModalOpen}
        onClose={() => setIsFlatModalOpen(false)}
      />

      <ImportDataModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />

      <NotificationSettingsModal
        isOpen={isNotificationSettingsOpen}
        onClose={() => setIsNotificationSettingsOpen(false)}
      />

      <ImpulseControlSettingsModal
        isOpen={isImpulseControlSettingsOpen}
        onClose={() => setIsImpulseControlSettingsOpen(false)}
      />

      <ConfirmDeleteModal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleResetData}
        title="Reset All Data"
        message="Are you sure you want to reset all data? This will permanently delete all members, bills, expenses, settlements, and flat settings. This action cannot be undone."
        itemName="all data"
        confirmText="Reset All Data"
        isDestructive={true}
      />
    </>
  );
}

