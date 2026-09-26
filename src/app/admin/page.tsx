import type { Metadata } from "next";
import { AdminLoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <AdminLoginForm />
    </main>
  );
}
