import { redirect } from "next/navigation";

/* Affiliates live inside the dashboard. Anyone arriving here signs in
   first and lands on their affiliate page. */
export default function AffiliatesRedirect() {
  redirect("/dashboard/affiliate");
}
