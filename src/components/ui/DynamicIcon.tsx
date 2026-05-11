"use client";

import React from "react";
import { RiArchiveLine, RiBox3Line, RiTruckLine, RiArrowLeftRightLine, RiDashboardLine, RiKanbanView, RiGroupLine, RiUserLine, RiHandCoinLine, RiBriefcaseLine, RiTimeLine, RiMoneyRupeeCircleLine, RiFileTextLine, RiReceiptLine, RiBuilding4Line, RiLayoutGridLine, RiPlugLine, RiLogoutBoxRLine, RiQuestionLine, RiFlashlightLine, RiDatabase2Line, RiStockLine, RiPulseLine, RiCheckDoubleLine, RiArrowRightUpLine, RiArrowRightLine, RiPencilLine, RiDeleteBinLine, RiHome4Line, RiSettings4Line, RiMenuLine, RiCloseLine, RiWhatsappLine, RiFingerprintLine, RiFileCheckLine, RiMailLine, RiCalendarCloseLine, RiBankCardLine, RiSmartphoneLine, RiTableLine, RiMessage2Line } from "react-icons/ri";
import { LucideProps } from "lucide-react";

export const lucideIconMap: Record<string, React.ElementType> = {
  package: RiArchiveLine,
  box: RiBox3Line,
  truck: RiTruckLine,
  "arrow-left-right": RiArrowLeftRightLine,
  "layout-dashboard": RiDashboardLine,
  kanban: RiKanbanView,
  users: RiGroupLine,
  user: RiUserLine,
  handshake: RiHandCoinLine,
  briefcase: RiBriefcaseLine,
  clock: RiTimeLine,
  "indian-rupee": RiMoneyRupeeCircleLine,
  "file-text": RiFileTextLine,
  receipt: RiReceiptLine,
  building: RiBuilding4Line,
  blocks: RiLayoutGridLine,
  puzzle: RiPlugLine,
  logout: RiLogoutBoxRLine,
  help: RiQuestionLine,
  zap: RiFlashlightLine,
  database: RiDatabase2Line,
  "trending-up": RiStockLine,
  activity: RiPulseLine,
  "check-circle": RiCheckDoubleLine,
  "arrow-up-right": RiArrowRightUpLine,
  "arrow-right": RiArrowRightLine,
  "pen-line": RiPencilLine,
  "trash-2": RiDeleteBinLine,
  home: RiHome4Line,
  settings: RiSettings4Line,
  menu: RiMenuLine,
  x: RiCloseLine,
  whatsapp: RiWhatsappLine,
  fingerprint: RiFingerprintLine,
  "file-check": RiFileCheckLine,
  mail: RiMailLine,
  "calendar-off": RiCalendarCloseLine,
  "credit-card": RiBankCardLine,
  smartphone: RiSmartphoneLine,
  table: RiTableLine,
  "message-square": RiMessage2Line,
};

interface DynamicIconProps extends Omit<LucideProps, "name"> {
  name: string | null | undefined;
}

export function DynamicIcon({ name, ...props }: DynamicIconProps) {
  if (!name) return <RiDashboardLine {...props} />;

  const IconComponent = lucideIconMap[name.toLowerCase()] || RiDashboardLine;
  return <IconComponent {...props} />;
}
