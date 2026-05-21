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
import { AxiosError } from "axios";

interface AddMemberDialog {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planId: string;
}

export function AddMemberDialog({
  open,
  onOpenChange,
  planId,
}: AddMemberDialog) {
  const addMemberSchema = z.object({
    email: z.email().min(1, { message: "Email cannot be empty" }),
  });
  type AddMemberForm = z.infer<typeof addMemberSchema>;

  const { getInputProps, onSubmit, reset } = useForm<AddMemberForm>({
    initialValues: { email: "" },
    validate: zod4Resolver(addMemberSchema),
    validateInputOnBlur: true,
  });

  const addMemberMutation = useMutation({
    mutationFn: async (data: AddMemberForm) => {
      const response = await axiosInstance.post(
        `/plans/${planId}/members`,
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      onOpenChange(false);
      reset();
      toast.success(`Member added successfully`);
    },
    onError: (error) => {
      let message = "Member could not be added";

      if (error instanceof AxiosError) {
        message =
          error.response?.data?.message ??
          error.response?.data?.error ??
          message;
      }

      toast.error(message);
      console.error(error);
    },
  });

  const handleSubmit = onSubmit((values) => {
    addMemberMutation.mutate(values);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="mb-2">
          <h3 className="pup-heading-three">Add new member</h3>
          <p className="pup-body-sm-400 text-neutral-dark-grey">
            Add a new member to your plan using their email
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <CustomInput
            className="mb-6"
            type="text"
            placeholder="user@example.com"
            inputProps={getInputProps("email")}
          />
          <PrimaryButton
            title="Create"
            className="uppercase w-full"
            type="submit"
            // isLoading={createPhaseMutation.isPending}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
