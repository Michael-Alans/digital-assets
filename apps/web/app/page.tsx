import HomePage from "./(public)/page";
import { ClerkProvider } from "@clerk/nextjs";

export default function Home() {
  return (
    <ClerkProvider>
      <HomePage />
    </ClerkProvider>
  );
}
