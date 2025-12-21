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

interface CreatePhaseDialog {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planId: string;
}

export function CreatePhaseDialog({
  open,
  onOpenChange,
  planId,
}: CreatePhaseDialog) {
  const createPhaseSchema = z.object({
    name: z
      .string()
      .nonempty()
      .min(2, { message: "Name must be atleast 2 characters" }),
  });
  type CreatePhaseForm = z.infer<typeof createPhaseSchema>;

  const { getInputProps, onSubmit, reset } = useForm<CreatePhaseForm>({
    initialValues: { name: "" },
    validate: zod4Resolver(createPhaseSchema),
    validateInputOnBlur: true,
  });

  const createPhaseMutation = useMutation({
    mutationFn: async (data: CreatePhaseForm) => {
      const response = await axiosInstance.post(
        `/plans/${planId}/phases`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["phases"] });
      onOpenChange(false);
      reset();
    },
    onError: (error) => {
      toast.success(`Phase Created Successfully`);
      console.error(error);
    },
  });

  const handleSubmit = onSubmit((values) => {
    createPhaseMutation.mutate(values);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="mb-2">
          <h3 className="pup-heading-three">Create New Phase</h3>
          <p className="pup-body-sm-400 text-neutral-dark-grey">
            Create a new phase by typing in the name
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
            title="Create"
            className="uppercase w-full"
            type="submit"
            isLoading={createPhaseMutation.isPending}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
