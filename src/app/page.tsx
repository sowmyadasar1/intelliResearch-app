import { LoginForm } from "@/components/auth/login-form";
import { Logo } from "@/components/icons";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
            <Logo className="h-12 w-12 text-primary" />
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground font-headline">
              Welcome to intelliResearch
            </h1>
            <p className="mt-2 text-muted-foreground">
              Your intelligent academic companion.
            </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
