import { lazy, ComponentType } from "react";

// Lazy load pages for code splitting
const Dashboard = lazy(() => import("../pages/Dashboard/DashboardPage"));
const Members = lazy(() => import("../pages/Members/MembersPage"));
const Bills = lazy(() => import("../pages/Bills/BillsPage"));
const Expenses = lazy(() => import("../pages/Expenses/ExpensesPage"));
const Settlements = lazy(() => import("../pages/Settlements/SettlementsPage"));
const Analytics = lazy(() => import("../pages/Analytics/AnalyticsPage"));
const Chores = lazy(() => import("../pages/Chores/ChoresPage"));
const Guests = lazy(() => import("../pages/Guests/GuestTrackingPage"));
const EmergencyFund = lazy(() => import("../pages/EmergencyFund/EmergencyFundPage"));
const ParentSummary = lazy(() => import("../pages/ParentSummary/ParentSummaryPage"));
const MoneyVibes = lazy(() => import("../pages/MoneyVibes/MoneyVibesPage"));
const Settings = lazy(() => import("../pages/Settings/SettingsPage"));

export interface RouteConfig {
  path: string;
  component: ComponentType;
  label: string;
  icon: string;
}

export const routes: RouteConfig[] = [
  {
    path: "/",
    component: Dashboard,
    label: "Dashboard",
    icon: "📊",
  },
  {
    path: "/members",
    component: Members,
    label: "Members",
    icon: "👥",
  },
  {
    path: "/bills",
    component: Bills,
    label: "Bills",
    icon: "📄",
  },
  {
    path: "/expenses",
    component: Expenses,
    label: "Expenses",
    icon: "💰",
  },
  {
    path: "/settlements",
    component: Settlements,
    label: "Settlements",
    icon: "💸",
  },
  {
    path: "/analytics",
    component: Analytics,
    label: "Analytics",
    icon: "📊",
  },
  {
    path: "/chores",
    component: Chores,
    label: "Chores",
    icon: "🧹",
  },
  {
    path: "/guests",
    component: Guests,
    label: "Guests",
    icon: "👤",
  },
  {
    path: "/emergency-fund",
    component: EmergencyFund,
    label: "Emergency Fund",
    icon: "💰",
  },
  {
    path: "/parent-summary",
    component: ParentSummary,
    label: "Parent Summary",
    icon: "📊",
  },
  {
    path: "/money-vibes",
    component: MoneyVibes,
    label: "Money Vibes",
    icon: "💚",
  },
  {
    path: "/settings",
    component: Settings,
    label: "Settings",
    icon: "⚙️",
  },
];

