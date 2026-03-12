import { Container } from "./Container";

export default function SiteFooter() {
  return (
    <footer className="bg-slate-50 py-8">
      <Container>
        <div className="text-center text-sm text-slate-500">
          © {new Date().getFullYear()}Digital Assets, Built by Michael Alans.
        </div>
      </Container>
    </footer>
  );
}