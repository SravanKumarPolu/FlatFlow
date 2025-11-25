import {
  useMembersStore,
  useBillsStore,
  useExpensesStore,
  useFlatStore,
  useUserStore,
  useSettlementsStore,
  useBillPaymentsStore,
  useChoresStore,
  useGuestsStore,
  useEmergencyFundStore,
  useImpulseControlStore,
} from "../stores";

export interface ExportedData {
  version: string;
  exportedAt: string;
  members: ReturnType<typeof useMembersStore.getState>["members"];
  bills: ReturnType<typeof useBillsStore.getState>["bills"];
  expenses: ReturnType<typeof useExpensesStore.getState>["expenses"];
  settlements: ReturnType<typeof useSettlementsStore.getState>["settlements"];
  billPayments: ReturnType<typeof useBillPaymentsStore.getState>["payments"];
  chores?: ReturnType<typeof useChoresStore.getState>["chores"];
  choreCompletions?: ReturnType<typeof useChoresStore.getState>["completions"];
  guests?: ReturnType<typeof useGuestsStore.getState>["guests"];
  emergencyFunds?: ReturnType<typeof useEmergencyFundStore.getState>["funds"];
  impulseControlLimits?: ReturnType<typeof useImpulseControlStore.getState>["limits"];
  flat: ReturnType<typeof useFlatStore.getState>["currentFlat"];
  currentMemberId: ReturnType<typeof useUserStore.getState>["currentMemberId"];
}

/**
 * Export all app data to JSON
 */
export function exportData(): ExportedData {
  const membersStore = useMembersStore.getState();
  const billsStore = useBillsStore.getState();
  const expensesStore = useExpensesStore.getState();
  const settlementsStore = useSettlementsStore.getState();
  const billPaymentsStore = useBillPaymentsStore.getState();
  const choresStore = useChoresStore.getState();
  const guestsStore = useGuestsStore.getState();
  const emergencyFundStore = useEmergencyFundStore.getState();
  const impulseControlStore = useImpulseControlStore.getState();
  const flatStore = useFlatStore.getState();
  const userStore = useUserStore.getState();

  return {
    version: "2.0.0",
    exportedAt: new Date().toISOString(),
    members: membersStore.members,
    bills: billsStore.bills,
    expenses: expensesStore.expenses,
    settlements: settlementsStore.settlements,
    billPayments: billPaymentsStore.payments,
    chores: choresStore.chores,
    choreCompletions: choresStore.completions,
    guests: guestsStore.guests,
    emergencyFunds: emergencyFundStore.funds,
    impulseControlLimits: impulseControlStore.limits,
    flat: flatStore.currentFlat,
    currentMemberId: userStore.currentMemberId,
  };
}

/**
 * Download exported data as JSON file
 */
export function downloadExportedData(): void {
  const data = exportData();
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `flatflow-export-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Reset all app data
 */
export function resetAllData(): void {
  useMembersStore.getState().resetMembers();
  useBillsStore.getState().resetBills();
  useExpensesStore.getState().resetExpenses();
  useSettlementsStore.getState().resetSettlements();
  useBillPaymentsStore.getState().resetPayments();
  useChoresStore.getState().resetChores();
  useGuestsStore.getState().resetGuests();
  useEmergencyFundStore.getState().resetAllFunds();
  useImpulseControlStore.getState().resetLimits();
  useFlatStore.getState().resetFlat();
  useUserStore.getState().resetUser();
  
  // Also clear localStorage for all stores
  const storageKeys = [
    "flatflow-members-storage",
    "flatflow-bills-storage",
    "flatflow-expenses-storage",
    "flatflow-settlements-storage",
    "flatflow-bill-payments-storage",
    "flatflow-chores-storage",
    "flatflow-guests-storage",
    "flatflow-emergency-fund-storage",
    "flatflow-impulse-control-storage",
    "flatflow-flat-storage",
    "flatflow-user-storage",
  ];
  
  storageKeys.forEach((key) => {
    localStorage.removeItem(key);
  });
}

/**
 * Validate imported data structure
 */
export function validateImportedData(data: unknown): { valid: boolean; error?: string } {
  if (!data || typeof data !== "object") {
    return { valid: false, error: "Invalid file format. Expected JSON object." };
  }

  const imported = data as Partial<ExportedData>;

  // Check for required fields
  if (!imported.version) {
    return { valid: false, error: "Missing version field. This may not be a valid FlatFlow export." };
  }

  // Validate structure (allow partial imports)
  if (imported.members !== undefined && !Array.isArray(imported.members)) {
    return { valid: false, error: "Invalid members data. Expected array." };
  }
  if (imported.bills !== undefined && !Array.isArray(imported.bills)) {
    return { valid: false, error: "Invalid bills data. Expected array." };
  }
  if (imported.expenses !== undefined && !Array.isArray(imported.expenses)) {
    return { valid: false, error: "Invalid expenses data. Expected array." };
  }
  if (imported.settlements !== undefined && !Array.isArray(imported.settlements)) {
    return { valid: false, error: "Invalid settlements data. Expected array." };
  }
  if (imported.billPayments !== undefined && !Array.isArray(imported.billPayments)) {
    return { valid: false, error: "Invalid bill payments data. Expected array." };
  }

  return { valid: true };
}

/**
 * Import data from JSON file
 */
export function importData(data: ExportedData, options?: { merge?: boolean }): void {
  const merge = options?.merge ?? false;

  if (!merge) {
    // Clear existing data first
    resetAllData();
  }

  // Import members
  if (data.members && data.members.length > 0) {
    const membersStore = useMembersStore.getState();
    if (merge) {
      // Merge: add new members, update existing ones
      data.members.forEach((member) => {
        const existing = membersStore.getMember(member.id);
        if (existing) {
          membersStore.updateMember(member.id, member);
        } else {
          // For new members, preserve the imported ID and timestamps
          membersStore.members.push(member);
        }
      });
      // Update the store state
      useMembersStore.setState({ members: membersStore.members });
    } else {
      // Replace: set all members directly
      useMembersStore.setState({ members: data.members });
    }
  }

  // Import bills
  if (data.bills && data.bills.length > 0) {
    const billsStore = useBillsStore.getState();
    if (merge) {
      data.bills.forEach((bill) => {
        const existing = billsStore.getBill(bill.id);
        if (existing) {
          billsStore.updateBill(bill.id, bill);
        } else {
          billsStore.bills.push(bill);
        }
      });
      useBillsStore.setState({ bills: billsStore.bills });
    } else {
      useBillsStore.setState({ bills: data.bills });
    }
  }

  // Import expenses
  if (data.expenses && data.expenses.length > 0) {
    const expensesStore = useExpensesStore.getState();
    if (merge) {
      data.expenses.forEach((expense) => {
        const existing = expensesStore.getExpense(expense.id);
        if (existing) {
          expensesStore.updateExpense(expense.id, expense);
        } else {
          expensesStore.expenses.push(expense);
        }
      });
      useExpensesStore.setState({ expenses: expensesStore.expenses });
    } else {
      useExpensesStore.setState({ expenses: data.expenses });
    }
  }

  // Import settlements
  if (data.settlements && data.settlements.length > 0) {
    const settlementsStore = useSettlementsStore.getState();
    if (merge) {
      data.settlements.forEach((settlement) => {
        const existing = settlementsStore.getSettlement(settlement.id);
        if (existing) {
          settlementsStore.updateSettlement(settlement.id, settlement);
        } else {
          settlementsStore.settlements.push(settlement);
        }
      });
      useSettlementsStore.setState({ settlements: settlementsStore.settlements });
    } else {
      useSettlementsStore.setState({ settlements: data.settlements });
    }
  }

  // Import bill payments
  if (data.billPayments && data.billPayments.length > 0) {
    const paymentsStore = useBillPaymentsStore.getState();
    if (merge) {
      data.billPayments.forEach((payment) => {
        const existing = paymentsStore.getPayment(payment.id);
        if (existing) {
          paymentsStore.updatePayment(payment.id, payment);
        } else {
          paymentsStore.payments.push(payment);
        }
      });
      useBillPaymentsStore.setState({ payments: paymentsStore.payments });
    } else {
      useBillPaymentsStore.setState({ payments: data.billPayments });
    }
  }

  // Import flat (replace, not merge)
  if (data.flat) {
    useFlatStore.getState().setCurrentFlat(data.flat);
  }

  // Import current member ID
  if (data.currentMemberId) {
    useUserStore.getState().setCurrentMemberId(data.currentMemberId);
  }

  // Import chores (if available - new in v2.0.0)
  if (data.chores && data.chores.length > 0) {
    useChoresStore.setState({ chores: data.chores });
  }
  if (data.choreCompletions && data.choreCompletions.length > 0) {
    useChoresStore.setState(() => ({
      completions: data.choreCompletions!,
    }));
  }

  // Import guests (if available - new in v2.0.0)
  if (data.guests && data.guests.length > 0) {
    const guestsStore = useGuestsStore.getState();
    if (merge) {
      // Merge: add new guests, update existing ones
      data.guests.forEach((guest) => {
        const existing = guestsStore.getGuest(guest.id);
        if (existing) {
          guestsStore.updateGuest(guest.id, guest);
        } else {
          // For new guests, preserve the imported ID and timestamps
          guestsStore.guests.push(guest);
        }
      });
      // Update the store state
      useGuestsStore.setState({ guests: guestsStore.guests });
    } else {
      // Replace: set all guests directly
      useGuestsStore.setState({ guests: data.guests });
    }
  }

  // Import emergency funds (if available - new in v2.0.0)
  if (data.emergencyFunds && data.emergencyFunds.length > 0) {
    const emergencyFundStore = useEmergencyFundStore.getState();
    if (merge) {
      // Merge: add new funds, update existing ones
      data.emergencyFunds.forEach((fund) => {
        const existing = emergencyFundStore.getFundByFlatId(fund.flatId);
        if (existing) {
          // Merge transactions and recalculate balance
          const allTransactions = [
            ...existing.transactions,
            ...fund.transactions.filter(
              (t) => !existing.transactions.find((et) => et.id === t.id)
            ),
          ];
          const newBalance = allTransactions.reduce((sum, t) => {
            return t.type === "CONTRIBUTION" ? sum + t.amount : sum - t.amount;
          }, 0);
          emergencyFundStore.funds = emergencyFundStore.funds.map((f) =>
            f.id === existing.id
              ? { ...fund, transactions: allTransactions, balance: newBalance }
              : f
          );
        } else {
          // Recalculate balance for new fund
          const newBalance = fund.transactions.reduce((sum, t) => {
            return t.type === "CONTRIBUTION" ? sum + t.amount : sum - t.amount;
          }, 0);
          emergencyFundStore.funds.push({ ...fund, balance: newBalance });
        }
      });
      useEmergencyFundStore.setState({ funds: emergencyFundStore.funds });
    } else {
      // Replace: recalculate balances for all funds
      const fundsWithRecalculatedBalance = data.emergencyFunds.map((fund) => {
        const balance = fund.transactions.reduce((sum, t) => {
          return t.type === "CONTRIBUTION" ? sum + t.amount : sum - t.amount;
        }, 0);
        return { ...fund, balance };
      });
      useEmergencyFundStore.setState({ funds: fundsWithRecalculatedBalance });
    }
  }

  // Import impulse control limits (if available - new in v2.0.0)
  if (data.impulseControlLimits && data.impulseControlLimits.length > 0) {
    useImpulseControlStore.setState({ limits: data.impulseControlLimits });
  }
}

/**
 * Parse JSON file and return data
 */
export async function parseImportFile(file: File): Promise<ExportedData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text);
        resolve(data as ExportedData);
      } catch (err) {
        reject(new Error("Failed to parse JSON file. Please ensure it's a valid FlatFlow export."));
      }
    };
    reader.onerror = () => {
      reject(new Error("Failed to read file."));
    };
    reader.readAsText(file);
  });
}

