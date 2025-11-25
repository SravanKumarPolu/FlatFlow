# Missing Features Checklist

## 🔴 Critical (MVP Blockers)

### 1. Data Layer
- [ ] Data storage (localStorage or IndexedDB)
- [ ] Data hooks (`useMembers`, `useBills`, `useExpenses`, `useSettlements`)
- [ ] State management (Zustand/Context/React Query)
- [ ] Data sync logic
- [ ] CRUD operations (Create, Read, Update, Delete)

### 2. Forms & Modals
- [ ] Add Member form/modal
- [ ] Add Bill form/modal
- [ ] Add Expense form/modal
- [ ] Edit Member/Bill/Expense modals
- [ ] Delete confirmations
- [ ] Form validation (Zod recommended)

### 3. Balance Calculations
- [ ] Calculate "You owe" from expenses/bills
- [ ] Calculate "You will receive" from settlements
- [ ] Calculate "This month total"
- [ ] Balance calculation logic (who owes whom)
- [ ] Settlement tracking & marking as paid

### 4. Bill Reminders
- [ ] Reminder notifications (browser/Capacitor)
- [ ] "Next bill due" calculation (dynamic, not hardcoded)
- [ ] Bill history tracking
- [ ] Mark bills as paid

---

## 🟠 High Priority (MVP Polish)

### 5. Charts & Analytics
- [ ] Expense charts (monthly trends)
- [ ] Category breakdown (pie/bar charts)
- [ ] Spending trends over time
- [ ] Charts library integration (Recharts/Chart.js)

### 6. Category Enhancements
**Current Bill Categories:** RENT, UTILITY, MAID, FOOD, OTHER
- [ ] Consider adding: WATER, DTH, GAS (or ensure UTILITY covers these)
- [ ] Consider adding: WIFI (or ensure UTILITY covers this)

**Current Expense Categories:** RENT, UTILITY, FOOD, TRAVEL, GROCERY, OTHER
- [ ] Consider adding: SWIGGY, OLA_UBER, GAS, MILK (or ensure FOOD/TRAVEL covers these)
- [ ] Consider adding: GUEST (for guest-related expenses)

---

## 🟡 Medium Priority (Phase 2 - PG OS Features)

### 7. Chores & Rotations
- [ ] `Chore` type definition
- [ ] Chores page/component
- [ ] Rotation logic (who's next)
- [ ] Chore completion tracking
- [ ] Reminders for chore assignments

### 8. Guest Tracking
- [ ] `Guest` type definition
- [ ] Guest tracking page/component
- [ ] Guest stay duration tracking
- [ ] Fair adjustments for guest stays (rent/utilities)
- [ ] Guest expense attribution

### 9. Shared Emergency Fund
- [ ] `EmergencyFund` type definition
- [ ] Emergency fund page/component
- [ ] Contributions tracking
- [ ] Withdrawals tracking
- [ ] Fund balance display

### 10. Parent Summary
- [ ] "One-tap summary for parents" page/component
- [ ] Monthly spending report
- [ ] Export to PDF/email
- [ ] Shareable link generation

---

## 🟢 Low Priority (Phase 3 - Secret Sauce)

### 11. Fairness & Reliability Score
- [ ] Payment history tracking
- [ ] Reliability metrics (who pays first, who delays)
- [ ] "Money Vibes" page
- [ ] Red/yellow/green health indicators

### 12. Impulse Control Nudges
- [ ] Spending category tracking (Swiggy, Ola/Uber)
- [ ] Weekly/monthly spending limits
- [ ] "Are you sure?" prompts before large expenses
- [ ] Regret score calculation

---

## 📦 Recommended Libraries to Add

```json
{
  "dependencies": {
    "zustand": "^4.4.0",           // State management
    "react-hook-form": "^7.48.0", // Forms
    "zod": "^3.22.0",              // Validation
    "date-fns": "^2.30.0",         // Date utilities
    "recharts": "^2.10.0"          // Charts
  }
}
```

---

## 🚀 Quick Start Implementation Order

1. **Week 1: Data Layer**
   - Install Zustand
   - Create data store
   - Create data hooks
   - Implement localStorage persistence

2. **Week 2: Forms**
   - Install React Hook Form + Zod
   - Create Add Member form
   - Create Add Bill form
   - Create Add Expense form

3. **Week 3: Calculations**
   - Implement balance calculation logic
   - Update Dashboard with real data
   - Add settlement tracking

4. **Week 4: Polish**
   - Add bill reminders
   - Add basic charts
   - Add loading/error states

---

*See GAP_ANALYSIS.md for detailed breakdown*




