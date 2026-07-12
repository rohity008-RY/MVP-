import type { ReactNode } from "react";
import { hasAdminSession } from "../lib/session";
import "./globals.css";

export const metadata = {
  title: "Bazaar Setu Admin",
  description: "Bazaar Setu operations and support console"
};

const nav = [
  ["/", "Dashboard"],
  ["/login", "Login"],
  ["/ops", "Ops Backend"],
  ["/orders", "Orders"],
  ["/sellers", "Sellers"],
  ["/requests", "Product Requests"],
  ["/settings", "Settings"]
];

export default async function RootLayout({ children }: { children: ReactNode }) {
  const loggedIn = await hasAdminSession();
  return (
    <html lang="en">
      <body>
        <div className="shell">
          <aside className="sidebar">
            <div className="brand">Bazaar<span>Setu</span></div>
            {nav.map(([href, label]) => <a href={href} className="nav-link" key={href}>{label}</a>)}
          </aside>
          <main className="main">
            <div className={loggedIn ? "demo-banner live" : "demo-banner"}>
              {loggedIn
                ? "Logged in. Admin/Ops pages are using protected backend data and actions."
                : "Demo preview data is visible until admin/support login is completed. Backend ops APIs remain protected."}
              {loggedIn ? (
                <form action="/api/logout" method="post">
                  <button className="link-button">Logout</button>
                </form>
              ) : null}
            </div>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
