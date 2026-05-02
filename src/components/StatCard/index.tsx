import { cn } from "@/lib/utils";
import React from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg: string;
  sub?: string;
}

export function StatCard({
  label,
  value,
  icon,
  iconBg,
  sub,
}: StatCardProps) {
  return (
    <div className="bg-white border border-off-white rounded-2xl p-5 flex gap-4">
      <div
        className={cn(
          "w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
          iconBg,
        )}
      >
        {icon}
      </div>
      <div>
        <p className="pup-heading-three text-neutral-black leading-none mb-1">
          {value}
        </p>
        <p className="pup-body-sm-400 text-neutral-grey">{label}</p>
        {sub && <p className="text-xs text-neutral-300 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
