import { Link } from "react-router-dom";
import { Instagram, Twitter, Facebook, Youtube, ShieldCheck, Truck, RotateCcw, Headphones } from "lucide-react";

const Footer = () => (
  <footer className="bg-ink text-white mt-24">
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 grid grid-cols-2 sm:grid-cols-4 gap-6 border-b border-white/10">
      {[
        { icon: Truck, title: "Free Shipping", desc: "On orders over ₹999" },
        { icon: RotateCcw, title: "Easy Returns", desc: "7-day return window" },
        { icon: ShieldCheck, title: "Secure Payments", desc: "100% protected checkout" },
        { icon: Headphones, title: "24/7 Support", desc: "We're here to help" },
      ].map((f) => (
        <div key={f.title} className="flex items-start gap-3">
          <f.icon size={22} className="text-gold shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium">{f.title}</p>
            <p className="text-xs text-white/60">{f.desc}</p>
          </div>
        </div>
      ))}
    </div>

    <div className="max-w-7xl mx-auto px-4 md:px-6 py-14 grid grid-cols-2 md:grid-cols-5 gap-8">
      <div className="col-span-2">
        <span className="font-display text-2xl font-bold">NEXORA</span>
        <p className="mt-3 text-sm text-white/60 max-w-xs">
          Premium multi-category shopping for fashion, electronics, watches, beauty and home — curated for modern living.
        </p>
        <div className="flex items-center gap-3 mt-5">
          {[Instagram, Twitter, Facebook, Youtube].map((Icon, i) => (
            <a key={i} href="#" className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
              <Icon size={16} />
            </a>
          ))}
        </div>
      </div>

      <FooterCol title="Shop" links={[
        { name: "New Arrivals", to: "/shop?newArrival=true" },
        { name: "Best Sellers", to: "/shop?bestseller=true" },
        { name: "Flash Sale", to: "/shop?flashSale=true" },
        { name: "All Products", to: "/shop" },
      ]} />
      <FooterCol title="Account" links={[
        { name: "My Orders", to: "/account/orders" },
        { name: "Wishlist", to: "/wishlist" },
        { name: "Track Order", to: "/account/orders" },
        { name: "Profile", to: "/account/profile" },
      ]} />
      <FooterCol title="Company" links={[
        { name: "About Us", to: "/" },
        { name: "Contact", to: "/" },
        { name: "Careers", to: "/" },
        { name: "Privacy Policy", to: "/" },
      ]} />
    </div>

    <div className="border-t border-white/10 py-6 text-center text-xs text-white/50">
      © {new Date().getFullYear()} NEXORA. All rights reserved.
    </div>
  </footer>
);

const FooterCol = ({ title, links }) => (
  <div>
    <p className="text-sm font-semibold mb-4">{title}</p>
    <ul className="space-y-2.5">
      {links.map((l) => (
        <li key={l.name}>
          <Link to={l.to} className="text-sm text-white/60 hover:text-white transition-colors">
            {l.name}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

export default Footer;
