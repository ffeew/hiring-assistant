import { SignUpForm } from "@/app/components/auth/signup-form";
import { BackgroundPattern } from "@/app/components/background-pattern";

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-muted relative">
      <BackgroundPattern />
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <SignUpForm />
      </div>
    </main>
  );
}