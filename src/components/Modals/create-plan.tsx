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

interface CreatePlanDialog {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePlanDialog({ open, onOpenChange }: CreatePlanDialog) {
  const createPlanSchema = z.object({
    name: z
      .string()
      .nonempty()
      .min(2, { message: "Name must be atleast 2 characters" }),
  });
  type CreatePlanForm = z.infer<typeof createPlanSchema>;

  const { getInputProps, onSubmit, reset } = useForm<CreatePlanForm>({
    initialValues: { name: "" },
    validate: zod4Resolver(createPlanSchema),
    validateInputOnBlur: true,
  });

  const createPlanMutation = useMutation({
    mutationFn: async (data: CreatePlanForm) => {
      const response = await axiosInstance.post("/plans", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allPlans"] });
      onOpenChange(false);
      reset();
    },
    onError: (error) => {
      toast.success(`Plan Created Successfully`);
      console.error(error);
    },
  });

  const handleSubmit = onSubmit((values) => {
    createPlanMutation.mutate(values);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="mb-2">
          <h3 className="pup-heading-three">Create New Plan</h3>
          <p className="pup-body-sm-400 text-neutral-dark-grey">
            Create a new plan by typing in the name and optionally add an image
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <CustomInput
            className="mb-6"
            type="text"
            placeholder="Plan Name"
            inputProps={getInputProps("name")}
          />
          <PrimaryButton
            title="Create"
            className="uppercase w-full"
            type="submit"
            isLoading={createPlanMutation.isPending}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
