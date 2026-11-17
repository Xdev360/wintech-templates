import { AuthShell } from "@/components/auth/AuthShell";
import { ResetForm } from "@/components/auth/ResetForm";

export default function ResetPage() {
  return (
    <AuthShell title="Reset your password" sub="Type the email you signed up with. We will send you a link to set a new password.">
      <ResetForm />
    </AuthShell>
  );
}
