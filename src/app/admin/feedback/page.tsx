import { AdminFeedbackConsole } from "@/components/admin-feedback-console";
import { listFeedback } from "@/lib/dining-intelligence";
import { branches } from "@/lib/demo-data";

export default function AdminFeedbackPage() {
  return <AdminFeedbackConsole branches={branches} initialFeedback={listFeedback()} />;
}
