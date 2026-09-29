import Link from 'next/link';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="bg-[#05070B] border-t border-white/[0.08] text-slate-400 mt-auto relative z-10">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1 space-y-3">
            <Logo size={28} showText={true} textWhite={true} />
            <p className="text-xs text-slate-400 leading-relaxed">
              Everyday banking, multi-currency cards, digital assets, and payment infrastructure in one clear experience.
            </p>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[10px] font-mono text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>All Systems Operational (99.99%)</span>
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="font-bold text-white mb-3 text-xs uppercase tracking-wider">Products</h3>
            <ul className="space-y-2 text-xs">
              <li><Link href="/cards" className="text-slate-400 hover:text-white transition-colors">Virtual &amp; Physical Cards</Link></li>
              <li><Link href="/payments" className="text-slate-400 hover:text-white transition-colors">Instant Transfers</Link></li>
              <li><Link href="/trading" className="text-slate-400 hover:text-blue-300 transition-colors">Crypto Spot Trading</Link></li>
              <li><Link href="/business" className="text-slate-400 hover:text-white transition-colors">Business Banking</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-bold text-white mb-3 text-xs uppercase tracking-wider">Developers</h3>
            <ul className="space-y-2 text-xs">
              <li><Link href="/developer" className="text-slate-400 hover:text-blue-300 transition-colors">Developer Portal</Link></li>
              <li><Link href="/developer/tester" className="text-slate-400 hover:text-blue-300 transition-colors">API Sandbox Tester</Link></li>
              <li><Link href="/services" className="text-slate-400 hover:text-white transition-colors">Ecosystem Directory</Link></li>
              <li><Link href="/transactions" className="text-slate-400 hover:text-white transition-colors">Statement Generator</Link></li>
            </ul>
          </div>

          {/* Security */}
          <div>
            <h3 className="font-bold text-white mb-3 text-xs uppercase tracking-wider">Compliance</h3>
            <ul className="space-y-2 text-xs">
              <li><span className="text-slate-400">256-bit AES Encryption</span></li>
              <li><span className="text-slate-400">Idempotent Webhooks</span></li>
              <li><span className="text-slate-400">Tier-1 Segregated Reserves</span></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/[0.08] flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Lingoung. Built with Next.js 16 &amp; MongoDB.</p>
          <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
            <span className="text-amber-400 text-[11px] font-medium">⚠️ Sandbox Simulator &bull; Demo Money Only</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
