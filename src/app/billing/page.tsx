import { StubPage } from "../(stubs)/stub-page";

export default function BillingPage() {
  return (
    <StubPage
      active="/billing"
      title="Billing"
      description="Transaction entry, ledgers, statements. Hooks into Charges and CMS-1500 generation."
    />
  );
}
