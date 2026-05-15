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

interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  isLoading?: boolean;
}

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  isLoading,
}: ConfirmDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="pup-heading-three text-neutral-black">{title}</DialogTitle>
          <DialogDescription className="pup-body-md-400 text-neutral-grey">
            {description}
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
            title="Delete"
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
