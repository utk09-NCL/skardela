// Skardela uses Umami analytics. Umami does not use cookies.
// The analytics script loads only after the player selects OK on the analytics notice.
// See "src/app/shell/AnalyticsNotice.tsx".

export const umami = {
  src: "https://cloud.umami.is/script.js",
  websiteId: "7ce42533-1688-4a51-9438-41cb377759e8",
} as const;

// This adds the analytics script to the page. When the page already has the script, it does nothing.
export function loadAnalytics(page: Document = document): void {
  if (page.querySelector(`script[src="${umami.src}"]`) !== null) return;
  const script = page.createElement("script");
  script.defer = true;
  script.src = umami.src;
  script.dataset.websiteId = umami.websiteId;
  page.head.append(script);
}
