import Link from "next/link";

import { getStoreSettings } from "@/lib/settings";

export const metadata = { title: "Privacy Policy" };

export default async function PrivacyPage() {
  const s = await getStoreSettings();

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 lg:px-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-paji-orange">Store policy</p>
      <h1 className="mt-3 font-serif text-4xl text-paji-charcoal">Privacy Policy</h1>
      <p className="mt-4 text-gray-600">
        {s.storeName} respects your privacy. This page explains what we collect when you browse, create an account, or
        place an order, and how we use it.
      </p>

      <section className="mt-10 space-y-8 text-gray-700">
        <div>
          <h2 className="text-xl font-semibold text-paji-charcoal">Information we collect</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>Name, mobile number, and delivery address for orders and login (including OTP verification).</li>
            <li>Order history, cart, and wishlist activity on this website.</li>
            <li>Payment status from our payment partner. We do not store your full card or UPI PIN on our servers.</li>
            <li>Basic device and usage data such as pages visited, to keep the site working and secure.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-paji-charcoal">How we use it</h2>
          <p className="mt-3 leading-relaxed">
            We use your information to process orders, arrange delivery, handle exchanges, send order updates, verify
            your account, improve the store, and comply with law. We do not sell your personal information.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-paji-charcoal">Sharing</h2>
          <p className="mt-3 leading-relaxed">
            We share details only with trusted partners who help us run the store — for example courier services,
            payment gateways, and SMS/OTP providers — and only as needed to complete your order or login. We may
            disclose information if required by law.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-paji-charcoal">Your choices</h2>
          <p className="mt-3 leading-relaxed">
            You can ask us to update account details or explain what we hold about you by contacting the store. Some
            information must be kept for orders, tax, and legal records.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-paji-charcoal">Contact</h2>
          <p className="mt-3 leading-relaxed">
            For privacy questions, call{" "}
            <a href={`tel:${s.phone.replace(/\s/g, "")}`} className="font-semibold text-paji-orange hover:underline">
              {s.phone}
            </a>{" "}
            or visit{" "}
            <Link href="/contact" className="font-semibold text-paji-orange hover:underline">
              Contact Us
            </Link>
            .
          </p>
          <p className="mt-2 text-sm text-gray-500">{s.address}</p>
        </div>
      </section>
    </div>
  );
}
