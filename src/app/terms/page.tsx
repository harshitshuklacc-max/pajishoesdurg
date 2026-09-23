import Link from "next/link";

import { getStoreSettings } from "@/lib/settings";

export const metadata = { title: "Terms and Conditions" };

export default async function TermsPage() {
  const s = await getStoreSettings();

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 lg:px-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-paji-orange">Store policy</p>
      <h1 className="mt-3 font-serif text-4xl text-paji-charcoal">Terms and Conditions</h1>
      <p className="mt-4 text-gray-600">
        These terms apply to every purchase from {s.storeName}, whether you shop online or visit our store in Durg.
      </p>

      <div className="mt-10 rounded-2xl border border-paji-orange/30 bg-paji-orange/5 p-8">
        <h2 className="text-xl font-semibold text-paji-charcoal">No returns. Exchange only within 3 days.</h2>
        <p className="mt-3 leading-relaxed text-gray-700">
          We do not accept returns or refunds on any product. You may request an exchange only, and only within 3 days
          of receiving your order (online) or of the bill date (in-store). After 3 days, no exchange will be allowed.
        </p>
      </div>

      <section className="mt-10 space-y-8 text-gray-700">
        <div>
          <h2 className="text-xl font-semibold text-paji-charcoal">Exchange conditions</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>The pair must be unused, unworn outdoors, and in original condition with tags, box, and bill.</li>
            <li>Exchange is for size or an equivalent product of the same value, subject to stock.</li>
            <li>If the replacement costs more, you pay the difference. If it costs less, the balance is store credit — not a cash refund.</li>
            <li>Products that are damaged by use, soiled, or missing packaging are not eligible for exchange.</li>
            <li>Sale, clearance, or custom items may be marked as non-exchangeable at the time of purchase.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-paji-charcoal">How to request an exchange</h2>
          <p className="mt-3 leading-relaxed">
            Contact us within 3 days with your order number or bill. Bring the product to our store, or follow the
            instructions our team shares for online orders. Visit{" "}
            <Link href="/contact" className="font-semibold text-paji-orange hover:underline">
              Contact Us
            </Link>{" "}
            or call {s.phone}.
          </p>
          <p className="mt-2 text-sm text-gray-500">{s.address}</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-paji-charcoal">Orders, pricing, and delivery</h2>
          <p className="mt-3 leading-relaxed">
            Product images are for display. Colour and finish can vary slightly. Prices and stock can change without
            notice until an order is confirmed. Delivery timelines are estimates. Risk in the goods passes to you on
            delivery.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-paji-charcoal">Use of this website</h2>
          <p className="mt-3 leading-relaxed">
            You agree to provide accurate details at checkout and not to misuse the site. We may refuse or cancel an
            order if we cannot verify details, stock, or payment.
          </p>
        </div>
      </section>
    </div>
  );
}
