import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { CustomInput } from "../CustomInput/input";
import z from "zod";
import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { PrimaryButton } from "../Button/primary-filled";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/utils/axios/axiosInstance";
import { queryClient } from "@/utils/queryclient/queryClient";
import { toast } from "sonner";

interface UpdatePhaseDialog {
  phaseName: string;
  phaseId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planId: string;
}

export function UpdatePhaseDialog({
  phaseName,
  phaseId,
  open,
  onOpenChange,
  planId,
}: UpdatePhaseDialog) {
  const updatePhaseSchema = z.object({
    name: z
      .string()
      .nonempty()
      .min(2, { message: "Name must be atleast 2 characters" }),
  });
  type UpdatePhaseForm = z.infer<typeof updatePhaseSchema>;

  const { getInputProps, onSubmit, reset } = useForm<UpdatePhaseForm>({
    initialValues: { name: phaseName },
    validate: zod4Resolver(updatePhaseSchema),
    validateInputOnBlur: true,
  });

  const updatePhaseMutation = useMutation({
    mutationFn: async (data: UpdatePhaseForm) => {
      const response = await axiosInstance.patch(
        `/plans/${planId}/phases/${phaseId}`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["phases"] });
      onOpenChange(false);
      reset();
      toast.success(`Phase updated successfully`);
    },
    onError: (error) => {
      toast.error(`Phase could not be updated`);
      console.error(error);
    },
  });

  const handleSubmit = onSubmit((values) => {
    updatePhaseMutation.mutate(values);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="mb-2">
          <h3 className="pup-heading-three">Update Phase</h3>
          <p className="pup-body-sm-400 text-neutral-dark-grey">
            Update your existing phase
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <CustomInput
            className="mb-6"
            type="text"
            placeholder="Phase Name"
            inputProps={getInputProps("name")}
          />
          <PrimaryButton
            title="Update"
            className="uppercase w-full"
            type="submit"
            isLoading={updatePhaseMutation.isPending}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
