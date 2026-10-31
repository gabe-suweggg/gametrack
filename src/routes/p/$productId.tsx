import { Link, createFileRoute } from "@tanstack/react-router";
import { ProductPage } from "@/components/product-page";
import { SiteHeader } from "@/components/site-header";
import { getProduct, locationFromSearch } from "@/data/product";

export const Route = createFileRoute("/p/$productId")({
  validateSearch: (search: Record<string, unknown>) => ({ loc: locationFromSearch(search) }),
  component: ProductRoute,
});

function ProductRoute() {
  const { productId } = Route.useParams();
  const { loc } = Route.useSearch();
  const item = getProduct(productId);
  if (!item) {
    return (
      <div className="min-h-screen bg-bg text-fg">
        <SiteHeader />
        <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <p>That product is not in the sample catalog.</p>
          <Link to="/" search={{ loc }} className="mt-4 inline-block text-accent">
            Back to tracked hardware
          </Link>
        </main>
      </div>
    );
  }
  return <ProductPage item={item} locationId={loc} />;
}