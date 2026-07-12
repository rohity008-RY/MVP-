import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Bazaar Setu Admin",
  description: "Bazaar Setu operations and support console"
};

const nav = [
  ["/", "Dashboard"],
  ["/ops", "Ops Backend"],
  ["/orders", "Orders"],
  ["/sellers", "Sellers"],
  ["/requests", "Product Requests"],
  ["/settings", "Settings"]
];

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="shell">
          <aside className="sidebar">
            <div className="brand">Bazaar<span>Setu</span></div>
            {nav.map(([href, label]) => <a href={href} className="nav-link" key={href}>{label}</a>)}
          </aside>
          <main className="main">{children}</main>
        </div>
      </body>
    </html>
  );
}
