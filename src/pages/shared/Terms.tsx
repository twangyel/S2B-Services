import PageHeader from '@/components/common/PageHeader';

export default function Terms() {
  return (
    <div>
      <PageHeader title="Terms of Service" />
      <div className="px-4 py-6">
        <div className="space-y-4 text-sm leading-relaxed text-foreground-muted">
          <p>
            Welcome to S2B Services. By using our platform, you agree to these Terms of Service.
          </p>
          <h3 className="font-semibold text-foreground">1. Service Description</h3>
          <p>
            S2B Services connects customers with local service providers in Bhutan. We do not
            provide the services directly but facilitate the connection between parties.
          </p>
          <h3 className="font-semibold text-foreground">2. User Responsibilities</h3>
          <p>
            Users must provide accurate information and use the platform responsibly. Providers
            must maintain professional standards and honor their commitments.
          </p>
          <h3 className="font-semibold text-foreground">3. Payments</h3>
          <p>
            All payments for services are handled directly between the customer and provider.
            Subscription fees for providers are non-refundable unless otherwise stated.
          </p>
          <h3 className="font-semibold text-foreground">4. Limitation of Liability</h3>
          <p>
            S2B Services is not liable for the quality of work performed by service providers.
            We recommend verifying provider credentials before hiring.
          </p>
        </div>
      </div>
    </div>
  );
}
