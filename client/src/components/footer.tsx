import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-card/90 py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-white">H</span>
              </div>
              <span className="text-2xl font-poppins font-bold bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
                HoloCasino
              </span>
            </div>
            <p className="text-white/70 mb-4">
              The ultimate Hololive-themed e-casino experience with $HOLOCOIN cryptocurrency.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-white/70 hover:text-primary transition">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-white/70 hover:text-primary transition">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a href="#" className="text-white/70 hover:text-primary transition">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2c5.714 0 10.34 4.627 10.34 10.34 0 5.714-4.626 10.34-10.34 10.34-5.714 0-10.34-4.626-10.34-10.34C1.66 6.627 6.286 2 12 2zm3.938 13.51c.08-.156.156-.299.22-.416.078-.14.131-.274.15-.388.028-.135.032-.24.02-.305-.015-.09-.068-.134-.13-.152-.06-.019-.142-.013-.226.02-.13.049-.244.136-.332.233a1.98 1.98 0 00-.23.323c-.015-.135-.05-.27-.118-.396a1.341 1.341 0 00-.143-.218c-.064-.08-.136-.15-.217-.212-.16-.119-.337-.199-.523-.26-.186-.06-.386-.1-.598-.118-.423-.037-.826.012-1.207.145-.382.134-.752.366-1.08.687-.324.323-.547.658-.67 1.006-.12.348-.15.696-.084 1.045.065.35.236.68.515.992.278.313.664.61 1.155.883.285.16.55.286.795.377.124.046.244.082.36.11.115.029.227.05.336.064.109.014.214.02.318.02.104-.001.206-.008.308-.024.102-.015.202-.039.302-.071.098-.032.196-.071.294-.119a1.991 1.991 0 00.271-.161c.041-.31.08-.065.118-.1.037-.036.072-.073.104-.112a1.12 1.12 0 00.086-.12c.023-.036.044-.072.062-.108z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a href="#" className="text-white/70 hover:text-primary transition">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.416 25.416 0 00-.564-1.236c3.145-1.28 4.577-3.124 4.761-3.362zM12 3.475c2.17 0 4.154.813 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.687 8.687 0 0112 3.475zm-3.633.803a53.896 53.896 0 013.167 4.935c-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 014.729-5.975zM3.453 12.01v-.26c.37.01 4.512.065 8.775-1.215.25.477.477.965.694 1.453-.109.033-.228.065-.336.098-4.404 1.42-6.747 5.303-6.942 5.629a8.522 8.522 0 01-2.19-5.705zM12 20.547a8.482 8.482 0 01-5.239-1.8c.152-.315 1.888-3.656 6.703-5.337.022-.01.033-.01.054-.022a35.32 35.32 0 011.823 6.475 8.4 8.4 0 01-3.341.684zm4.761-1.465c-.086-.52-.542-3.015-1.659-6.084 2.679-.423 5.022.271 5.314.369a8.468 8.468 0 01-3.655 5.715z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-poppins font-bold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/">
                  <a className="text-white/70 hover:text-primary transition">Games</a>
                </Link>
              </li>
              <li>
                <Link href="/marketplace">
                  <a className="text-white/70 hover:text-primary transition">Marketplace</a>
                </Link>
              </li>
              <li>
                <Link href="/wallet">
                  <a className="text-white/70 hover:text-primary transition">Wallet</a>
                </Link>
              </li>
              <li>
                <Link href="/profile">
                  <a className="text-white/70 hover:text-primary transition">Profile</a>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-poppins font-bold text-lg mb-4">Help & Support</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-white/70 hover:text-primary transition">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-primary transition">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-primary transition">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-primary transition">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-poppins font-bold text-lg mb-4">Newsletter</h4>
            <p className="text-white/70 mb-4">
              Subscribe to our newsletter for updates and promotions.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email address"
                className="w-full bg-card/50 rounded-l-lg border border-white/10 px-4 py-2 text-white"
              />
              <button className="bg-primary px-4 rounded-r-lg text-white">Join</button>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center text-white/50 text-sm">
          <p>
            © {new Date().getFullYear()} HoloCasino. All rights reserved. This is a fictional platform for entertainment
            purposes only.
          </p>
          <p className="mt-2">$HOLOCOIN has no real monetary value and cannot be exchanged for real currency.</p>
        </div>
      </div>
    </footer>
  );
}
