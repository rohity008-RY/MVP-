export const appConfig = {
  appName: "Bazaar Setu",
  supportEmail: "support@bazaarsetu.in",
  maxCustomerAddresses: 5,
  defaultCurrency: "INR",
  launchLanguages: ["en", "hi", "mr"] as const,
  orderFlow: [
    "placed",
    "confirmed",
    "invoice_required",
    "bag_packed",
    "handed_over",
    "delivered"
  ] as const
};
