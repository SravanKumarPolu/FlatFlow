import { useState, useEffect, useMemo } from "react";
import { Button, Input } from "@flatflow/ui";
import { useImpulseControl, useToast, useExpenses, useFlat } from "../../hooks";
import { ImpulseCategory, SpendingLimit } from "../../stores/impulseControlStore";
import { calculateSpendingStatus } from "../../lib/impulseControl";

interface ImpulseControlSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ImpulseControlSettingsModal({
  isOpen,
  onClose,
}: ImpulseControlSettingsModalProps) {
  const { limits, globalEnabled, setLimit, setGlobalEnabled, resetLimits } = useImpulseControl();
  const { expenses, getExpensesByFlatId } = useExpenses();
  const { getCurrentFlatId } = useFlat();
  const { success } = useToast();
  const currentFlatId = getCurrentFlatId();
  const [localLimits, setLocalLimits] = useState<SpendingLimit[]>([]);
  const [localGlobalEnabled, setLocalGlobalEnabled] = useState(true);

  const flatExpenses = useMemo(() => {
    if (!currentFlatId) return [];
    return getExpensesByFlatId(currentFlatId);
  }, [expenses, currentFlatId, getExpensesByFlatId]);

  const spendingStatuses = useMemo(() => {
    return calculateSpendingStatus(flatExpenses, localLimits);
  }, [flatExpenses, localLimits]);

  useEffect(() => {
    if (isOpen) {
      setLocalLimits([...limits]);
      setLocalGlobalEnabled(globalEnabled);
    }
  }, [isOpen, limits, globalEnabled]);

  const updateLimit = (
    category: ImpulseCategory,
    field: "weeklyLimit" | "monthlyLimit" | "enabled",
    value: number | boolean | null
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
    setGlobalEnabled(localGlobalEnabled);
    success("Spending limits updated successfully");
    onClose();
  };

  const handleReset = () => {
    resetLimits();
    setLocalLimits([...limits]);
    setLocalGlobalEnabled(globalEnabled);
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
        <div className="modal-box max-w-3xl max-h-[90vh] overflow-y-auto">
          <h3 className="font-bold text-lg mb-2">Impulse Control</h3>
          <p className="text-sm text-base-content/60 mb-6">
            Set gentle spending limits for food, travel, and app spends. We&apos;ll nudge you when you&apos;re about to overshoot.
          </p>

          {/* Global Toggle */}
          <div className="card bg-base-200 border border-base-300 mb-6">
            <div className="card-body p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-lg mb-1">Enable Impulse Control Nudges</h4>
                  <p className="text-sm text-base-content/60">
                    Turn on/off all spending limit nudges
                  </p>
                </div>
                <label className="cursor-pointer label gap-2">
                  <span className="label-text text-sm">Enabled</span>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary toggle-lg"
                    checked={localGlobalEnabled}
                    onChange={(e) => setLocalGlobalEnabled(e.target.checked)}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {localLimits.map((limit) => {
              const status = spendingStatuses.find((s) => s.category === limit.category);
              const weeklySpent = status?.currentWeekly || 0;
              const monthlySpent = status?.currentMonthly || 0;
              const weeklyRemaining = limit.weeklyLimit !== null ? (limit.weeklyLimit - weeklySpent) : null;
              const monthlyRemaining = limit.monthlyLimit !== null ? (limit.monthlyLimit - monthlySpent) : null;
              const weeklyPercentage = status?.weeklyPercentage || 0;
              const monthlyPercentage = status?.monthlyPercentage || 0;

              return (
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
                      <>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <Input
                              label="Weekly Limit (₹)"
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="No limit"
                              value={limit.weeklyLimit === null ? "" : limit.weeklyLimit}
                              onChange={(e) => {
                                const value = e.target.value.trim();
                                if (value === "" || value === "0") {
                                  updateLimit(limit.category, "weeklyLimit", null);
                                } else {
                                  const numValue = parseFloat(value);
                                  if (!isNaN(numValue) && numValue >= 0) {
                                    updateLimit(limit.category, "weeklyLimit", numValue);
                                  }
                                }
                              }}
                            />
                            {limit.weeklyLimit !== null && status && (
                              <div className="text-xs text-base-content/60 mt-1">
                                Spent: ₹{weeklySpent.toFixed(2)} / ₹{limit.weeklyLimit.toFixed(2)} ({weeklyPercentage.toFixed(0)}%)
                                {weeklyRemaining !== null && (
                                  <span className={weeklyRemaining < 0 ? "text-error" : "text-success"}>
                                    {" "}• Remaining: ₹{Math.max(0, weeklyRemaining).toFixed(2)}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <div>
                            <Input
                              label="Monthly Limit (₹)"
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="No limit"
                              value={limit.monthlyLimit === null ? "" : limit.monthlyLimit}
                              onChange={(e) => {
                                const value = e.target.value.trim();
                                if (value === "" || value === "0") {
                                  updateLimit(limit.category, "monthlyLimit", null);
                                } else {
                                  const numValue = parseFloat(value);
                                  if (!isNaN(numValue) && numValue >= 0) {
                                    updateLimit(limit.category, "monthlyLimit", numValue);
                                  }
                                }
                              }}
                            />
                            {limit.monthlyLimit !== null && status && (
                              <div className="text-xs text-base-content/60 mt-1">
                                Spent: ₹{monthlySpent.toFixed(2)} / ₹{limit.monthlyLimit.toFixed(2)} ({monthlyPercentage.toFixed(0)}%)
                                {monthlyRemaining !== null && (
                                  <span className={monthlyRemaining < 0 ? "text-error" : "text-success"}>
                                    {" "}• Remaining: ₹{Math.max(0, monthlyRemaining).toFixed(2)}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Visual Progress Bars */}
                        {status && (limit.weeklyLimit !== null || limit.monthlyLimit !== null) && (
                          <div className="space-y-2">
                            {limit.weeklyLimit !== null && (
                              <div>
                                <div className="flex justify-between text-xs mb-1">
                                  <span>Weekly Progress</span>
                                  <span className={weeklyPercentage >= 100 ? "text-error" : weeklyPercentage >= 80 ? "text-warning" : ""}>
                                    {weeklyPercentage.toFixed(0)}%
                                  </span>
                                </div>
                                <progress
                                  className={`progress w-full ${
                                    weeklyPercentage >= 100
                                      ? "progress-error"
                                      : weeklyPercentage >= 80
                                        ? "progress-warning"
                                        : "progress-primary"
                                  }`}
                                  value={Math.min(100, weeklyPercentage)}
                                  max="100"
                                ></progress>
                              </div>
                            )}
                            {limit.monthlyLimit !== null && (
                              <div>
                                <div className="flex justify-between text-xs mb-1">
                                  <span>Monthly Progress</span>
                                  <span className={monthlyPercentage >= 100 ? "text-error" : monthlyPercentage >= 80 ? "text-warning" : ""}>
                                    {monthlyPercentage.toFixed(0)}%
                                  </span>
                                </div>
                                <progress
                                  className={`progress w-full ${
                                    monthlyPercentage >= 100
                                      ? "progress-error"
                                      : monthlyPercentage >= 80
                                        ? "progress-warning"
                                        : "progress-primary"
                                  }`}
                                  value={Math.min(100, monthlyPercentage)}
                                  max="100"
                                ></progress>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
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
