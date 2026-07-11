import Container from "../components/layout/Container";
import Button from "../components/ui/Button";

export default function NotFound() {
  return (
    <section className="py-28">
      <Container className="text-center">
        <p className="font-display text-7xl font-bold text-teal">404</p>
        <h1 className="mt-4 font-display text-2xl font-bold text-navy">Page not found</h1>
        <p className="mx-auto mt-3 max-w-md text-slate-600">
          The page you are looking for does not exist or may have moved.
        </p>
        <Button to="/" className="mt-8">
          Back to Home
        </Button>
      </Container>
    </section>
  );
}
