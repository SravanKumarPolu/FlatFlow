import { useState, useEffect } from "react";
import { Button, Input } from "@flatflow/ui";
import { useImpulseControl, useToast } from "../../hooks";
import { ImpulseCategory, SpendingLimit } from "../../stores/impulseControlStore";

interface ImpulseControlSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ImpulseControlSettingsModal({
  isOpen,
  onClose,
}: ImpulseControlSettingsModalProps) {
  const { limits, setLimit, resetLimits } = useImpulseControl();
  const { success } = useToast();
  const [localLimits, setLocalLimits] = useState<SpendingLimit[]>([]);

  useEffect(() => {
    if (isOpen) {
      setLocalLimits([...limits]);
    }
  }, [isOpen, limits]);

  const updateLimit = (
    category: ImpulseCategory,
    field: "weeklyLimit" | "monthlyLimit" | "enabled",
    value: number | boolean
  ) => {
    setLocalLimits((prev) =>
      prev.map((limit) =>
        limit.category === category
          ? { ...limit, [field]: value }
          : limit
      )
    );
  };

  const handleSave = () => {
    localLimits.forEach((limit) => {
      setLimit(
        limit.category,
        limit.weeklyLimit,
        limit.monthlyLimit,
        limit.enabled
      );
    });
    success("Spending limits updated successfully");
    onClose();
  };

  const handleReset = () => {
    resetLimits();
    setLocalLimits([...limits]);
    success("Spending limits reset to defaults");
  };

  if (!isOpen) return null;

  const categoryLabels: Record<ImpulseCategory, string> = {
    SWIGGY: "🍔 Swiggy",
    OLA_UBER: "🚗 Ola/Uber",
    FOOD: "🍽️ Food",
    TRAVEL: "✈️ Travel",
  };

  return (
    <>
      <input
        type="checkbox"
        id="impulse-control-settings-modal"
        className="modal-toggle"
        checked={isOpen}
        onChange={() => {}}
      />
      <div className="modal" role="dialog">
        <div className="modal-box max-w-2xl">
          <h3 className="font-bold text-lg mb-4">Impulse Control Settings</h3>
          <p className="text-sm text-base-content/60 mb-6">
            Set spending limits to get nudged when you're about to exceed them.
          </p>

          <div className="space-y-6">
            {localLimits.map((limit) => (
              <div
                key={limit.category}
                className="card bg-base-200 border border-base-300"
              >
                <div className="card-body p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-lg">
                      {categoryLabels[limit.category]}
                    </h4>
                    <label className="cursor-pointer label gap-2">
                      <span className="label-text text-sm">Enabled</span>
                      <input
                        type="checkbox"
                        className="toggle toggle-primary"
                        checked={limit.enabled}
                        onChange={(e) =>
                          updateLimit(limit.category, "enabled", e.target.checked)
                        }
                      />
                    </label>
                  </div>

                  {limit.enabled && (
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Weekly Limit (₹)"
                        type="number"
                        step="0.01"
                        min="0"
                        value={limit.weeklyLimit}
                        onChange={(e) =>
                          updateLimit(
                            limit.category,
                            "weeklyLimit",
                            parseFloat(e.target.value) || 0
                          )
                        }
                      />
                      <Input
                        label="Monthly Limit (₹)"
                        type="number"
                        step="0.01"
                        min="0"
                        value={limit.monthlyLimit}
                        onChange={(e) =>
                          updateLimit(
                            limit.category,
                            "monthlyLimit",
                            parseFloat(e.target.value) || 0
                          )
                        }
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="modal-action mt-6">
            <Button variant="outline" onClick={handleReset}>
              Reset to Defaults
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Save Settings
            </Button>
          </div>
        </div>
        <label className="modal-backdrop" onClick={onClose}></label>
      </div>
    </>
  );
}

