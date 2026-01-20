import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { RequestForm } from "@/components/RequestForm";

export default async function NewRequestPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <RequestForm />
    </div>
  );
}
