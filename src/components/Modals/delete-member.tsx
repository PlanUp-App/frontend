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

interface DeleteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  memberName: string;
  isLoading?: boolean;
}

export function DeleteMemberDialog({
  open,
  onOpenChange,
  onConfirm,
  memberName,
  isLoading,
}: DeleteMemberDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="pup-heading-three">Remove Member</DialogTitle>
          <DialogDescription className="pup-body-md-400 text-neutral-grey">
            Are you sure you want to remove <strong>{memberName}</strong> from
            this plan? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-3 mt-4">
          <OutlineButton
            className="border-primary-orange text-primary-orange"
            title="Cancel"
            type="button"
            onClick={() => onOpenChange(false)}
            isLoading={isLoading}
          />
          <PrimaryButton
            title="Remove"
            type="button"
            className="bg-red-500 hover:bg-red-600 border-none"
            onClick={onConfirm}
            isLoading={isLoading}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
