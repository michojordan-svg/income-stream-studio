import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPolicy,
  head: () => ({
    meta: [
      { title: "Privacy Policy — Income Autopilot" },
      { name: "description", content: "How Income Autopilot collects, uses, and protects your data." },
    ],
  }),
});

const LAST_UPDATED = "July 18, 2026";
const CONTACT_EMAIL = "michojordan8@gmail.com";

function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-background">
      {/* Top nav bar */}
      <header className="sticky top-0 z-10 border-b border-border-soft bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-md bg-navy">
              <span className="font-mono text-xs font-semibold text-primary-foreground">IA</span>
            </div>
            <span className="text-sm font-semibold text-navy">Income Autopilot</span>
          </div>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-navy"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-border-soft bg-navy px-6 py-16 text-center">
        <div className="mx-auto max-w-2xl">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-primary-foreground/10 ring-1 ring-primary-foreground/20">
            <ShieldCheck className="h-6 w-6 text-primary-foreground" strokeWidth={1.8} />
          </div>
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-primary-foreground/50">
            Legal · Privacy
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-primary-foreground sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-primary-foreground/60">
            Last updated: {LAST_UPDATED}
          </p>
        </div>
      </section>

      {/* Body */}
      <div className="mx-auto max-w-3xl px-6 py-14">
        {/* Intro callout */}
        <div className="mb-12 rounded-xl border border-primary/20 bg-primary/5 px-6 py-5 text-sm leading-relaxed text-foreground">
          <strong className="font-semibold text-navy">The short version:</strong> Income Autopilot
          collects only what it needs to provide the service, never sells your data, and gives you full
          control over what you share. Read on for the full details.
        </div>

        <div className="space-y-12 text-sm leading-7 text-foreground">

          <Section title="1. Who We Are">
            <p>
              Income Autopilot ("we", "us", or "our") is an automated income-stream dashboard for
              creators managing Pinterest affiliates, YouTube channels, and digital product sales.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your
              information when you use our platform.
            </p>
            <p>
              If you have questions, reach us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-primary hover:underline">
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </Section>

          <Section title="2. Information We Collect">
            <SubHeading>Information you provide</SubHeading>
            <ul className="list-disc space-y-1 pl-5">
              <li><strong>Account data</strong> — your email address, optional username, and hashed password when you create an account.</li>
              <li><strong>Platform credentials</strong> — API tokens or OAuth credentials for third-party platforms (Pinterest, YouTube, Gumroad, Buffer, Bitly) that you voluntarily connect. These are stored encrypted and used solely to power the integrations you enable.</li>
              <li><strong>Content</strong> — titles, descriptions, and metadata for content items, affiliate links, and digital products you create inside the dashboard.</li>
              <li><strong>Preferences</strong> — notification settings, display options, and other configuration choices.</li>
            </ul>

            <SubHeading>Information collected automatically</SubHeading>
            <ul className="list-disc space-y-1 pl-5">
              <li><strong>Usage data</strong> — pages visited, features used, and actions taken within the app (e.g. link clicks tracked for your affiliate analytics).</li>
              <li><strong>Log data</strong> — IP address, browser type, operating system, referring URL, and timestamps recorded in server logs.</li>
              <li><strong>Device data</strong> — browser version and viewport size used to optimise the mobile experience.</li>
            </ul>

            <SubHeading>Information from third parties</SubHeading>
            <p>
              When you connect an external platform, we receive only the data scopes you authorise —
              for example, read-only channel analytics from YouTube or click stats from Bitly. We
              never request write permissions beyond what a feature explicitly requires.
            </p>
          </Section>

          <Section title="3. How We Use Your Information">
            <p>We use the information we collect to:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Create and maintain your account and authenticate you securely.</li>
              <li>Fetch, aggregate, and display analytics from the platforms you connect.</li>
              <li>Send transactional emails (password resets, account notices) — no marketing without opt-in.</li>
              <li>Operate scheduled posts and automated workflows you configure.</li>
              <li>Detect abuse and enforce our Terms of Service.</li>
              <li>Improve the product using aggregated, anonymised usage patterns.</li>
            </ul>
            <p>
              We do <strong>not</strong> use your data to train AI models, build advertising profiles,
              or share it with data brokers.
            </p>
          </Section>

          <Section title="4. Legal Basis for Processing (GDPR)">
            <p>
              If you are located in the European Economic Area or the United Kingdom, we process your
              personal data under the following legal bases:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li><strong>Contract</strong> — processing necessary to provide the service you signed up for.</li>
              <li><strong>Legitimate interests</strong> — security monitoring, abuse prevention, and product improvement, where these interests are not overridden by your rights.</li>
              <li><strong>Consent</strong> — optional features such as marketing emails, where you can withdraw consent at any time.</li>
              <li><strong>Legal obligation</strong> — retaining certain records where required by law.</li>
            </ul>
          </Section>

          <Section title="5. Sharing Your Information">
            <p>
              We do <strong>not</strong> sell, rent, or trade your personal data. We share it only in
              these limited circumstances:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li><strong>Service providers</strong> — infrastructure and hosting providers who process data on our behalf under confidentiality agreements.</li>
              <li><strong>Third-party platforms</strong> — only the data needed to fulfil the actions you initiate (e.g. publishing a post to Pinterest).</li>
              <li><strong>Legal requirements</strong> — if required by law, court order, or to protect the rights and safety of our users.</li>
              <li><strong>Business transfers</strong> — in the event of a merger or acquisition, your data would transfer subject to the same privacy commitments.</li>
            </ul>
          </Section>

          <Section title="6. Data Retention">
            <p>
              We keep your account data for as long as your account is active. If you delete your
              account, we delete or anonymise your personal data within 30 days, except where
              retention is required by law (e.g. financial records up to 7 years).
            </p>
            <p>
              Aggregated, non-identifiable analytics data may be retained indefinitely to improve
              the service.
            </p>
          </Section>

          <Section title="7. Security">
            <p>
              We use industry-standard safeguards to protect your information:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>All data in transit is encrypted with TLS 1.2+.</li>
              <li>Passwords are hashed with bcrypt (never stored in plain text).</li>
              <li>Platform tokens are stored encrypted at rest.</li>
              <li>Authentication sessions use signed JSON Web Tokens with short expiry windows.</li>
              <li>Database access is restricted to application servers; no direct public access.</li>
            </ul>
            <p>
              No system is 100% secure. If you discover a security issue, please disclose it
              responsibly to{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-primary hover:underline">
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </Section>

          <Section title="8. Cookies and Tracking">
            <p>
              We use only functional cookies and browser storage necessary to operate the service:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li><strong>Authentication token</strong> — stored in <code className="rounded bg-cream-soft px-1 py-0.5 font-mono text-[12px]">localStorage</code> to keep you signed in.</li>
              <li><strong>Preference storage</strong> — stores display settings locally in your browser.</li>
            </ul>
            <p>
              We do not use third-party advertising cookies, tracking pixels, or cross-site analytics.
            </p>
          </Section>

          <Section title="9. Your Rights">
            <p>You have the right to:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li><strong>Access</strong> — request a copy of the personal data we hold about you.</li>
              <li><strong>Correction</strong> — update inaccurate or incomplete data (most of which you can do directly in Settings).</li>
              <li><strong>Deletion</strong> — request erasure of your account and associated data.</li>
              <li><strong>Portability</strong> — receive your data in a machine-readable format.</li>
              <li><strong>Objection / restriction</strong> — object to or restrict certain processing activities.</li>
              <li><strong>Withdraw consent</strong> — for any processing based on consent, at any time.</li>
            </ul>
            <p>
              To exercise any of these rights, email us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-primary hover:underline">
                {CONTACT_EMAIL}
              </a>
              . We will respond within 30 days. EEA/UK residents may also lodge a complaint with
              their local data protection authority.
            </p>
          </Section>

          <Section title="10. Children's Privacy">
            <p>
              Income Autopilot is not directed at children under 13 (or 16 in the EEA). We do not
              knowingly collect personal data from minors. If we learn we have done so, we will
              delete it promptly. Contact us if you believe a minor has provided us data.
            </p>
          </Section>

          <Section title="11. International Transfers">
            <p>
              Your data may be processed in countries outside your own, including the United States.
              Where required, we rely on Standard Contractual Clauses or other approved mechanisms to
              ensure adequate protection of your data during international transfers.
            </p>
          </Section>

          <Section title="12. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. When we make material changes, we
              will update the "Last updated" date at the top of this page and, where appropriate,
              notify you by email or an in-app banner. Continued use of the service after changes
              take effect constitutes acceptance of the revised policy.
            </p>
          </Section>

          <Section title="13. Contact Us">
            <p>
              Questions, requests, or concerns about this Privacy Policy? Get in touch:
            </p>
            <address className="not-italic">
              <div className="mt-3 inline-block rounded-lg border border-border-soft bg-card px-5 py-4 text-sm leading-7">
                <strong className="block font-semibold text-navy">Income Autopilot</strong>
                <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-primary hover:underline">
                  {CONTACT_EMAIL}
                </a>
              </div>
            </address>
          </Section>

        </div>

        {/* Footer nav */}
        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-border-soft pt-8 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Income Autopilot. All rights reserved.</span>
          <div className="flex gap-4">
            <Link to="/" className="hover:text-navy transition-colors">Sign in</Link>
            <Link to="/signup" className="hover:text-navy transition-colors">Create account</Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-4 text-base font-semibold text-navy">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-4 mb-1.5 font-semibold text-navy/80">{children}</p>
  );
}
