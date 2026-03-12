import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-[calc(100vh-160px)] items-center justify-center bg-surface py-12">
      <SignIn 
        path="/sign-in"
        routing="path"
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/buyer/my-assets"
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