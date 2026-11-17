import type { Metadata } from "next";
import { ResetForm } from "@/components/auth/ResetForm";
import { AuthBackdrop } from "@/components/v4/AuthBackdrop";
import { ModalFrame } from "@/components/v4/AuthModal";
import { MascotSays } from "@/components/v4/Mascot";

export const metadata: Metadata = { title: "Reset your password · Wintech Templates" };

export default function ResetPage() {
  return (
    <AuthBackdrop>
      <ModalFrame label="Reset your password">
        <div className="flex flex-col gap-5">
          <MascotSays eyes="open" text="No wahala. Let's get you back in." />
          <div>
            <h2 className="text-[24px] font-semibold tracking-[-0.01em]">Reset your password</h2>
            <p className="mt-2 text-[15px] leading-[22px] text-[rgba(10,14,23,0.75)]">Type the email you signed up with. We will send you a link to set a new password.</p>
          </div>
          <ResetForm />
        </div>
      </ModalFrame>
    </AuthBackdrop>
  );
}
