import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-20 bg-navy text-white/80">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-3 lg:px-6">
        <div>
          <Logo light />
          <p className="mt-4 max-w-sm text-sm leading-relaxed">
            Secure Tech Consultancy (Pvt) Ltd delivers IT security, biometrics and identity
            management solutions to enterprise and public-sector clients across Pakistan.
          </p>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">Company</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/about" className="hover:text-brand">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/products" className="hover:text-brand">
                Products
              </Link>
            </li>
            <li>
              <Link to="/careers" className="hover:text-brand">
                Careers
              </Link>
            </li>
            <li>
              <Link to="/hr-login" className="hover:text-brand">
                HR Login
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">Contact</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent-red" />
              Secure Tech Consultancy, Islamabad, Pakistan
            </li>
            <li className="flex gap-2">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-accent-red" />
              +92 51 000 0000
            </li>
            <li className="flex gap-2">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent-red" />
              careers@securetech.com.pk
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs">
        © {new Date().getFullYear()} Secure Tech Consultancy (Pvt) Ltd. All rights reserved.
      </div>
    </footer>
  );
}
