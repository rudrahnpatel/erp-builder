"use client";

import React from "react";
import {
  Package,
  Box,
  Truck,
  ArrowLeftRight,
  LayoutDashboard,
  Kanban,
  Users,
  User,
  Handshake,
  Briefcase,
  Clock,
  IndianRupee,
  FileText,
  Receipt,
  Building2,
  Blocks,
  Puzzle,
  LogOut,
  HelpCircle,
  Zap,
  Database,
  TrendingUp,
  Activity,
  CheckCircle2,
  ArrowUpRight,
  ArrowRight,
  PenLine,
  Trash2,
  Home,
  Settings,
  Menu,
  X,
  LucideProps,
} from "lucide-react";

export const lucideIconMap: Record<string, React.ElementType> = {
  package: Package,
  box: Box,
  truck: Truck,
  "arrow-left-right": ArrowLeftRight,
  "layout-dashboard": LayoutDashboard,
  kanban: Kanban,
  users: Users,
  user: User,
  handshake: Handshake,
  briefcase: Briefcase,
  clock: Clock,
  "indian-rupee": IndianRupee,
  "file-text": FileText,
  receipt: Receipt,
  building: Building2,
  blocks: Blocks,
  puzzle: Puzzle,
  logout: LogOut,
  help: HelpCircle,
  zap: Zap,
  database: Database,
  "trending-up": TrendingUp,
  activity: Activity,
  "check-circle": CheckCircle2,
  "arrow-up-right": ArrowUpRight,
  "arrow-right": ArrowRight,
  "pen-line": PenLine,
  "trash-2": Trash2,
  home: Home,
  settings: Settings,
  menu: Menu,
  x: X,
};

interface DynamicIconProps extends Omit<LucideProps, "name"> {
  name: string | null | undefined;
}

export function DynamicIcon({ name, ...props }: DynamicIconProps) {
  if (!name) return <LayoutDashboard {...props} />;

  const IconComponent = lucideIconMap[name.toLowerCase()] || LayoutDashboard;
  return <IconComponent {...props} />;
}
