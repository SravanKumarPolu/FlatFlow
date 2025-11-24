import { useState, useEffect } from "react";
import { Button } from "@flatflow/ui";
import { useNotificationSettings } from "../../hooks/useNotificationSettings";

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationSettingsModal({
  isOpen,
  onClose,
}: NotificationSettingsModalProps) {
  const {
    isSupported,
    permission,
    enabled,
    reminderDays,
    canNotify,
    setEnabled,
    setReminderDays,
    requestPermission,
  } = useNotificationSettings();

  const [localReminderDays, setLocalReminderDays] = useState<number[]>(reminderDays);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    setLocalReminderDays(reminderDays);
  }, [reminderDays]);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    const granted = await requestPermission();
    setIsRequesting(false);
    if (granted) {
      setEnabled(true);
    }
  };

  const handleSave = () => {
    setReminderDays(localReminderDays);
    onClose();
  };

  const toggleReminderDay = (day: number) => {
    if (localReminderDays.includes(day)) {
      setLocalReminderDays(localReminderDays.filter((d) => d !== day));
    } else {
      setLocalReminderDays([...localReminderDays, day].sort((a, b) => b - a));
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <input
        type="checkbox"
        id="notification-settings-modal"
        className="modal-toggle"
        checked={isOpen}
        onChange={() => {}}
      />
      <div className={`modal ${isOpen ? "modal-open" : ""}`} role="dialog">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Notification Settings</h3>

          {!isSupported ? (
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
                Notifications are not supported in this browser.
              </span>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Permission Status */}
              <div>
                <label className="label">
                  <span className="label-text font-medium">Permission Status</span>
                </label>
                <div className="flex items-center gap-2">
                  <span
                    className={`badge ${
                      permission === "granted"
                        ? "badge-success"
                        : permission === "denied"
                        ? "badge-error"
                        : "badge-warning"
                    }`}
                  >
                    {permission === "granted"
                      ? "Granted"
                      : permission === "denied"
                      ? "Denied"
                      : "Not Requested"}
                  </span>
                  {permission !== "granted" && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={handleRequestPermission}
                      disabled={isRequesting || permission === "denied"}
                    >
                      {isRequesting
                        ? "Requesting..."
                        : permission === "denied"
                        ? "Permission Denied"
                        : "Request Permission"}
                    </Button>
                  )}
                </div>
                {permission === "denied" && (
                  <p className="text-sm text-base-content/60 mt-2">
                    Notifications are blocked. Please enable them in your browser settings.
                  </p>
                )}
              </div>

              {/* Enable/Disable */}
              {canNotify && (
                <div className="form-control">
                  <label className="label cursor-pointer">
                    <div>
                      <span className="label-text font-medium">Enable Notifications</span>
                      <p className="text-sm text-base-content/60">
                        Get reminders for upcoming bills
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      className="toggle toggle-primary"
                      checked={enabled}
                      onChange={(e) => setEnabled(e.target.checked)}
                    />
                  </label>
                </div>
              )}

              {/* Reminder Days */}
              {canNotify && enabled && (
                <div>
                  <label className="label">
                    <span className="label-text font-medium">Remind Me</span>
                  </label>
                  <div className="space-y-2">
                    {[7, 5, 3, 2, 1, 0].map((day) => (
                      <label key={day} className="label cursor-pointer">
                        <span className="label-text">
                          {day === 0
                            ? "On due date"
                            : day === 1
                            ? "1 day before"
                            : `${day} days before`}
                        </span>
                        <input
                          type="checkbox"
                          className="checkbox checkbox-primary"
                          checked={localReminderDays.includes(day)}
                          onChange={() => toggleReminderDay(day)}
                        />
                      </label>
                    ))}
                  </div>
                  {localReminderDays.length === 0 && (
                    <p className="text-sm text-error mt-2">
                      Please select at least one reminder day.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="modal-action">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            {canNotify && enabled && (
              <Button
                type="button"
                variant="primary"
                onClick={handleSave}
                disabled={localReminderDays.length === 0}
              >
                Save
              </Button>
            )}
          </div>
        </div>
        <label className="modal-backdrop" onClick={onClose}></label>
      </div>
    </>
  );
}

