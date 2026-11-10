import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// Internal video-export tool page — not a published article. Keep it out
// of search results without blocking it from being crawled/rendered.
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function TenerifeIntroSocialLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
