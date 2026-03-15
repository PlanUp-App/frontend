import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { PrimaryButton } from "../Button/primary-filled";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/utils/axios/axiosInstance";
import { toast } from "sonner";
import { useState } from "react";
import { cn } from "@/lib/utils";

type ReportCategory =
  | "SPAM"
  | "HARASSMENT"
  | "INAPPROPRIATE_CONTENT"
  | "FAKE_PROFILE"
  | "OTHER";

const categories: {
  value: ReportCategory;
  label: string;
  description: string;
}[] = [
  {
    value: "SPAM",
    label: "Spam",
    description: "Unsolicited or repetitive content",
  },
  {
    value: "HARASSMENT",
    label: "Harassment",
    description: "Bullying, threats, or targeted abuse",
  },
  {
    value: "INAPPROPRIATE_CONTENT",
    label: "Inappropriate content",
    description: "Offensive or explicit material",
  },
  {
    value: "FAKE_PROFILE",
    label: "Fake profile",
    description: "Impersonation or false identity",
  },
  {
    value: "OTHER",
    label: "Other",
    description: "Something else not listed above",
  },
];

interface ReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportedUserId: string;
  reportedUserName: string;
  planId?: string;
  targetId?: string;
}

type Step = "category" | "details" | "success";

export function ReportModal({
  open,
  onOpenChange,
  reportedUserId,
  reportedUserName,
  planId,
  targetId,
}: ReportModalProps) {
  const [step, setStep] = useState<Step>("category");
  const [selectedCategory, setSelectedCategory] =
    useState<ReportCategory | null>(null);
  const [description, setDescription] = useState("");

  const reset = () => {
    setStep("category");
    setSelectedCategory(null);
    setDescription("");
  };

  const handleClose = (open: boolean) => {
    if (!open) reset();
    onOpenChange(open);
  };

  const reportMutation = useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.post("/reports", {
        reportedUserId,
        category: selectedCategory,
        description: description.trim() || undefined,
        planId,
        targetId: targetId ?? reportedUserId,
      });
      return response.data;
    },
    onSuccess: () => {
      setStep("success");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? "Failed to submit report");
    },
  });

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        {/* ── Success ── */}
        {step === "success" ? (
          <div className="flex flex-col items-center py-6 text-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 13l4 4L19 7"
                  stroke="#16a34a"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <h3 className="pup-heading-three">Report submitted</h3>
              <p className="pup-body-sm-400 text-neutral-dark-grey mt-1">
                Our team will review your report within 24–48 hours.
              </p>
            </div>
            <PrimaryButton
              title="Done"
              className="uppercase w-full mt-2"
              onClick={() => handleClose(false)}
            />
          </div>
        ) : (
          <>
            <DialogHeader className="mb-2">
              <h3 className="pup-heading-three">
                {step === "category"
                  ? `Report ${reportedUserName}`
                  : "Add details"}
              </h3>
              <p className="pup-body-sm-400 text-neutral-dark-grey">
                {step === "category"
                  ? "Select a reason for your report"
                  : "Help us understand what happened"}
              </p>
            </DialogHeader>

            {/* ── Category step ── */}
            {step === "category" && (
              <div className="flex flex-col gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setSelectedCategory(cat.value)}
                    className={cn(
                      "cursor-pointer flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-colors",
                      selectedCategory === cat.value
                        ? "border-primary-orange bg-primary-orange/5"
                        : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50",
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                        selectedCategory === cat.value
                          ? "border-primary-orange bg-primary-orange"
                          : "border-neutral-300",
                      )}
                    >
                      {selectedCategory === cat.value && (
                        <div className="h-1.5 w-1.5 rounded-full bg-white" />
                      )}
                    </div>
                    <div>
                      <p className="pup-body-sm-500 text-neutral-black">
                        {cat.label}
                      </p>
                      <p className="text-xs text-neutral-dark-grey">
                        {cat.description}
                      </p>
                    </div>
                  </button>
                ))}

                <PrimaryButton
                  title="Continue"
                  className="uppercase w-full mt-2"
                  onClick={() => selectedCategory && setStep("details")}
                  disabled={!selectedCategory}
                />
              </div>
            )}

            {/* ── Details step ── */}
            {step === "details" && (
              <div className="flex flex-col gap-4">
                {/* Selected category pill + back */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStep("category")}
                    className="pup-body-sm-400 text-neutral-dark-grey hover:text-neutral-black transition-colors flex items-center gap-1"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M9 11L5 7l4-4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Back
                  </button>
                  <div className="h-3 w-px bg-neutral-200" />
                  <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-dark-grey">
                    {
                      categories.find((c) => c.value === selectedCategory)
                        ?.label
                    }
                  </span>
                </div>

                <div>
                  <label className="pup-body-md-500 block text-neutral-black mb-1.5">
                    Additional details{" "}
                    <span className="pup-body-sm-400 text-neutral-dark-grey">
                      (optional)
                    </span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what happened..."
                    maxLength={500}
                    rows={4}
                    className="w-full resize-none rounded-xl border-2 border-neutral-200 px-4 py-3 pup-body-sm-400 text-neutral-black placeholder:text-neutral-300 outline-none transition focus:border-primary-orange"
                  />
                  <p className="text-right text-xs text-neutral-300 mt-1">
                    {description.length}/500
                  </p>
                </div>

                <PrimaryButton
                  title="Submit report"
                  className="uppercase w-full"
                  onClick={() => reportMutation.mutate()}
                  isLoading={reportMutation.isPending}
                />

                <p className="text-center text-xs text-neutral-300">
                  Reports are reviewed within 24–48 hours
                </p>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
