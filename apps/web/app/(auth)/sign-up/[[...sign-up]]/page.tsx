import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-[calc(100vh-160px)] items-center justify-center bg-surface py-12">
      <SignUp 
        path="/sign-up"
        routing="path"
        signInUrl="/sign-in"
        // Updated for Clerk v5: Triggers AuthSync on first landing
        forceRedirectUrl="/buyer/my-assets"
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-none border border-border rounded-xl",
            formButtonPrimary: "bg-primary hover:bg-primary/90 text-sm normal-case",
            footerActionLink: "text-primary hover:text-primary/80"
          }
        }}
      />
    </div>
  );
}