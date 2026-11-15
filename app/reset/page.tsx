import { AuthShell } from "@/components/auth/AuthShell";
import { ResetForm } from "@/components/auth/ResetForm";

export default function ResetPage() {
  return (
    <AuthShell title="Forgot your password?" sub="Put in your email and we send a link to set a new one." step={0}>
      <ResetForm />
    </AuthShell>
  );
}
