import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { PrimaryButton } from "../Button/primary-filled";
import { OutlineButton } from "../Button/outline";

interface DeletePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  planName: string;
  isLoading?: boolean;
}

export function DeletePlanDialog({
  open,
  onOpenChange,
  onConfirm,
  planName,
  isLoading,
}: DeletePlanDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="pup-heading-three text-red-600">Delete Plan</DialogTitle>
          <DialogDescription className="pup-body-md-400 text-neutral-grey">
            Are you sure you want to delete <strong>{planName}</strong>? This action cannot be undone and will permanently remove this plan and all associated data.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-3 mt-4">
          <OutlineButton
            className="border-neutral-300 text-neutral-600 hover:bg-neutral-50"
            title="Cancel"
            type="button"
            onClick={() => onOpenChange(false)}
            isLoading={isLoading}
          />
          <PrimaryButton
            title="Delete Plan"
            type="button"
            className="bg-red-500 hover:bg-red-600 border-none text-white"
            onClick={onConfirm}
            isLoading={isLoading}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
