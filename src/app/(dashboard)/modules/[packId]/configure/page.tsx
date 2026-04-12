"use client";

import { useState, use } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Wrench,
  Database,
  GitBranch,
  Shield,
  Rocket,
  ChevronRight,
  ChevronLeft,
  Check,
  Info,
  Save,
} from "lucide-react";

const steps = [
  { label: "Builder", icon: Wrench, description: "Configure fields and rules" },
  { label: "Data Model", icon: Database, description: "Review table schema" },
  { label: "Workflow", icon: GitBranch, description: "Set up automations" },
  { label: "Access", icon: Shield, description: "Permissions & Roles" },
  { label: "Deploy", icon: Rocket, description: "Publish your module" },
];

const attendanceFields = [
  { name: "Employee Name", type: "Text", required: true, description: "Data Type: Text" },
  { name: "Employee ID", type: "Text", required: true, description: "Data Type: Text - Required" },
  { name: "Check-in Time", type: "Time", required: false, description: "Data Type: Time" },
  { name: "Check-out Time", type: "Time", required: false, description: "Data Type: Time" },
  { name: "Status", type: "Single select", required: false, description: "Data Type: Single-select" },
  { name: "Late Arrival", type: "Checkbox", required: false, description: "Data Type: Checkbox" },
  { name: "Overtime Hours", type: "Number", required: false, description: "Data Type: Number" },
];

const sampleEmployees = [
  { name: "Priya Sharma", id: "EMP-00124", checkin: "09:15 AM", checkout: "06:45 PM", status: "Present" },
  { name: "Amit Patel", id: "EMP-00125", checkin: "09:30 AM", checkout: "07:05 PM", status: "Present" },
  { name: "Deepika Nair", id: "EMP-00128", checkin: "—", checkout: "—", status: "Absent" },
  { name: "Rahul Verma", id: "EMP-00132", checkin: "08:05 AM", checkout: "06:00 PM", status: "Present" },
  { name: "Anjali Gupta", id: "EMP-00140", checkin: "10:45 AM", checkout: "06:15 PM", status: "Half+" },
];

const statusColorMap: Record<string, string> = {
  Present: "bg-emerald-50 text-emerald-700",
  Absent: "bg-red-50 text-red-700",
  "Half+": "bg-amber-50 text-amber-700",
};

const avatarColors = [
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-rose-100 text-rose-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
];

export default function ConfigurePage({ params }: { params: Promise<{ packId: string }> }) {
  const { packId } = use(params);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedFields, setSelectedFields] = useState<Record<string, boolean>>(
    Object.fromEntries(attendanceFields.map((f) => [f.name, true]))
  );
  const [previewMode, setPreviewMode] = useState(false);

  const toggleField = (name: string) => {
    if (attendanceFields.find((f) => f.name === name)?.required) return;
    setSelectedFields((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col -m-4 sm:-m-6">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b glass" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="flex items-center gap-2 text-sm">
          <span className="hidden sm:inline" style={{ color: "var(--foreground-muted)" }}>Modules</span>
          <ChevronRight className="hidden sm:block h-3.5 w-3.5" style={{ color: "var(--foreground-dimmed)" }} />
          <span style={{ color: "var(--foreground-muted)" }}>Attendance</span>
          <ChevronRight className="h-3.5 w-3.5" style={{ color: "var(--foreground-dimmed)" }} />
          <span className="font-medium" style={{ color: "var(--foreground)" }}>Configure</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs" style={{ color: "var(--foreground-muted)" }}>
            Step {currentStep + 1} of {steps.length}
          </span>
          <Button size="sm" className="gap-1.5 text-xs">
            <Save className="h-3.5 w-3.5" /> Save Progress
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* Left sidebar: Steps */}
        <div className="w-full lg:w-[220px] border-b lg:border-b-0 lg:border-r overflow-y-auto" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-1)" }}>
          <div className="p-3 lg:p-4 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible">
            {steps.map((step, i) => (
              <button
                key={step.label}
                onClick={() => setCurrentStep(i)}
                className={`flex items-center gap-2 lg:gap-3 px-3 py-2 lg:py-2.5 text-sm rounded-lg transition-all whitespace-nowrap shrink-0 lg:w-full ${
                  currentStep === i
                    ? "font-medium"
                    : ""
                }`}
                style={{
                  background: currentStep === i ? "var(--primary)" : "transparent",
                  color: currentStep === i ? "var(--primary-foreground)" : i < currentStep ? "var(--success)" : "var(--foreground-muted)",
                }}
              >
                <div
                  className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0`}
                  style={{ background: currentStep === i ? "rgba(255,255,255,0.2)" : i < currentStep ? "var(--success-subtle)" : "var(--surface-3)" }}
                >
                  {i < currentStep ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    i + 1
                  )}
                </div>
                <div className="text-left">
                  <div className="font-medium">{step.label}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Center: Configuration Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6" style={{ background: "var(--background)" }}>
          {currentStep === 0 && (
            <div className="max-w-xl">
              <h2 className="text-xl font-bold mb-1" style={{ color: "var(--foreground)" }}>
                Attendance Module Setup
              </h2>
              <p className="text-sm mb-6" style={{ color: "var(--foreground-muted)" }}>
                Define data points for collection
              </p>

              {/* Step headers */}
              <div className="space-y-6 mb-8">
                <div className="flex items-start gap-3">
                  <div className="h-7 w-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#2b3437]">
                      Configure Fields
                    </h3>
                    <p className="text-xs text-[#64748b]">
                      Define data points for collection
                    </p>
                  </div>
                </div>
              </div>

              {/* Select Required Fields */}
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--foreground-dimmed)" }}>
                Select Required Fields
              </h4>
              <div className="space-y-2">
                {attendanceFields.map((field) => (
                  <div
                    key={field.name}
                    onClick={() => toggleField(field.name)}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedFields[field.name]
                        ? "bg-primary/5" // Use tailwind utility for translucent bg
                        : "hover:bg-surface-3"
                    }`}
                    style={{
                      borderColor: selectedFields[field.name] ? "var(--primary)" : "var(--border-subtle)",
                      background: selectedFields[field.name] ? "var(--primary-subtle)" : "var(--card)"
                    }}
                  >
                    <div
                      className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-all`}
                      style={{
                        borderColor: selectedFields[field.name] ? "var(--primary)" : "var(--border-subtle)",
                        background: selectedFields[field.name] ? "var(--primary)" : "transparent"
                      }}
                    >
                      {selectedFields[field.name] && (
                        <Check className="h-3 w-3" style={{ color: "var(--primary-foreground)" }} />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                          {field.name}
                        </span>
                        {field.required && (
                          <Badge className="text-[9px] border-0" style={{ background: "var(--danger-subtle)", color: "var(--danger)" }}>
                            Required
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs" style={{ color: "var(--foreground-muted)" }}>
                        {field.description}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Live Preview */}
        <div className="hidden xl:block w-[420px] border-l overflow-y-auto" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-1)" }}>
          <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-2)" }}>
            <div>
              <h3 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                Live Preview: Attendance Table
              </h3>
              <p className="text-[10px]" style={{ color: "var(--foreground-muted)" }}>
                Real-time visualization of your current field selection.
              </p>
            </div>
            <Button
              variant={previewMode ? "default" : "outline"}
              size="sm"
              className="text-[10px] h-7"
              onClick={() => setPreviewMode(!previewMode)}
            >
              Preview Mode
            </Button>
          </div>

          <div className="p-4">
            <div className="rounded-xl border overflow-hidden shadow-sm" style={{ background: "var(--card)", borderColor: "var(--border-subtle)" }}>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-1)" }}>
                    <th className="text-left px-3 py-2.5 font-semibold uppercase tracking-wider" style={{ color: "var(--foreground-dimmed)" }}>
                      Employee
                    </th>
                    <th className="text-left px-3 py-2.5 font-semibold uppercase tracking-wider" style={{ color: "var(--foreground-dimmed)" }}>
                      ID
                    </th>
                    {selectedFields["Check-in Time"] && (
                      <th className="text-left px-3 py-2.5 font-semibold uppercase tracking-wider" style={{ color: "var(--foreground-dimmed)" }}>
                        Check In
                      </th>
                    )}
                    {selectedFields["Check-out Time"] && (
                      <th className="text-left px-3 py-2.5 font-semibold uppercase tracking-wider" style={{ color: "var(--foreground-dimmed)" }}>
                        Check Out
                      </th>
                    )}
                    {selectedFields["Status"] && (
                      <th className="text-left px-3 py-2.5 font-semibold uppercase tracking-wider" style={{ color: "var(--foreground-dimmed)" }}>
                        Status
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {sampleEmployees.map((emp, i) => (
                    <tr
                      key={emp.id}
                      className="border-b last:border-0"
                      style={{ borderColor: "var(--border-subtle)", background: "var(--card)" }}
                    >
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <div
                            className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold`}
                            style={{ background: "var(--surface-3)", color: "var(--foreground)" }}
                          >
                            {emp.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <span className="font-medium" style={{ color: "var(--foreground)" }}>
                            {emp.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 font-mono" style={{ color: "var(--foreground-muted)" }}>
                        {emp.id}
                      </td>
                      {selectedFields["Check-in Time"] && (
                        <td className="px-3 py-2.5" style={{ color: "var(--foreground)" }}>
                          {emp.checkin}
                        </td>
                      )}
                      {selectedFields["Check-out Time"] && (
                        <td className="px-3 py-2.5" style={{ color: "var(--foreground)" }}>
                          {emp.checkout}
                        </td>
                      )}
                      {selectedFields["Status"] && (
                        <td className="px-3 py-2.5">
                          <Badge
                            className={`text-[9px] font-medium border-0`}
                            style={{ background: "var(--surface-3)", color: "var(--foreground-muted)" }}
                          >
                            {emp.status}
                          </Badge>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="rounded-lg border p-3" style={{ background: "var(--card)", borderColor: "var(--border-subtle)" }}>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Info className="h-3.5 w-3.5 text-primary" />
                  <h4 className="text-[10px] font-semibold uppercase" style={{ color: "var(--foreground)" }}>
                    Dynamic Validations
                  </h4>
                </div>
                <p className="text-[10px] leading-relaxed" style={{ color: "var(--foreground-muted)" }}>
                  Required fields will automatically generate form validations
                  in the Attendance entry screen.
                </p>
              </div>
              <div className="rounded-lg border p-3" style={{ background: "var(--card)", borderColor: "var(--border-subtle)" }}>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Info className="h-3.5 w-3.5 text-primary" />
                  <h4 className="text-[10px] font-semibold uppercase" style={{ color: "var(--foreground)" }}>
                    Field Visibility
                  </h4>
                </div>
                <p className="text-[10px] leading-relaxed" style={{ color: "var(--foreground-muted)" }}>
                  Fields like &apos;Late Arrival&apos; are calculated
                  automatically based on &apos;Check-in Time&apos;.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-t glass" style={{ borderColor: "var(--border-subtle)" }}>
        <Button
          variant="outline"
          disabled={currentStep === 0}
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          className="gap-1.5"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>
        <Button
          onClick={() =>
            setCurrentStep(Math.min(steps.length - 1, currentStep + 1))
          }
          className="gap-1.5 bg-primary"
        >
          {currentStep === steps.length - 1 ? "Deploy Module" : "Next Step"}{" "}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
