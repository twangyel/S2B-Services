import PageHeader from '@/components/common/PageHeader';

export default function Privacy() {
  return (
    <div>
      <PageHeader title="Privacy Policy" />
      <div className="px-4 py-6">
        <div className="space-y-4 text-sm leading-relaxed text-foreground-muted">
          <p>
            S2B Services is committed to protecting your privacy. This policy explains how we
            collect, use, and safeguard your personal information.
          </p>
          <h3 className="font-semibold text-foreground">1. Information We Collect</h3>
          <p>
            We collect your name, phone number, location, and service preferences to connect you
            with relevant service providers.
          </p>
          <h3 className="font-semibold text-foreground">2. How We Use Your Data</h3>
          <p>
            Your data is used solely for matching you with service providers and improving our
            platform. We never sell your personal information.
          </p>
          <h3 className="font-semibold text-foreground">3. Data Sharing</h3>
          <p>
            When you contact a provider, your phone number and location are shared with them to
            facilitate the service.
          </p>
          <h3 className="font-semibold text-foreground">4. Security</h3>
          <p>
            We implement industry-standard security measures to protect your data from unauthorized
            access.
          </p>
        </div>
      </div>
    </div>
  );
}
