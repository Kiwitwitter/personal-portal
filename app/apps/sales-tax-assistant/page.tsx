/* eslint-disable react/no-unescaped-entities */
import { Metadata } from 'next'
import { Container } from '@/components/ui/Container'

export const metadata: Metadata = {
  title: 'Sales Tax Assistant - Support | Peng Zhang',
  description: 'Support page for Sales Tax Assistant iOS app. Get help with widgets, searches, and in-app purchases.',
}

export default function SalesTaxAssistantPage() {
  return (
    <div className="py-16">
      <Container>
        {/* Header */}
        <div className="mb-12 border-b border-border pb-6">
          <div className="flex items-center gap-2 font-mono text-sm text-muted-foreground mb-4">
            <span className="text-green-500">$</span>
            <span>cat ./apps/sales-tax-assistant/README.md</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4 font-mono">Sales Tax Assistant</h1>
          <p className="text-lg text-muted-foreground font-mono">
            <span className="text-blue-400">iOS widget app</span> for checking <span className="text-green-400">US & Canada</span> sales tax rates
          </p>
        </div>

        {/* Overview */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 font-mono text-foreground">Overview</h2>
          <div className="bg-muted/50 rounded-lg p-6 font-mono text-sm">
            <p className="mb-4">
              Sales Tax Assistant is an iOS home screen widget that helps you instantly check sales tax rates across the United States and Canada.
              Whether you're shopping, traveling, or just curious about local tax rates, this app provides quick and accurate information right on your home screen.
            </p>
            <div className="border-l-2 border-green-500 pl-4 text-muted-foreground">
              <p className="mb-2"><span className="text-green-500">→</span> Supports iOS 16.0 and later</p>
              <p className="mb-2"><span className="text-green-500">→</span> Available for iPhone</p>
              <p><span className="text-green-500">→</span> No external dependencies - 100% native iOS</p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 font-mono text-foreground">
            <span className="text-green-500">#</span> Features
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-muted/50 rounded-lg p-4 border border-border">
              <h3 className="font-mono font-bold text-green-500 mb-2">📌 Fixed Location Widget</h3>
              <p className="font-mono text-sm text-muted-foreground">Pin a location and always see that tax rate on your home screen</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 border border-border">
              <h3 className="font-mono font-bold text-blue-500 mb-2">📍 Auto Location Widget</h3>
              <p className="font-mono text-sm text-muted-foreground">Automatically show tax rate for your current GPS location</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 border border-border">
              <h3 className="font-mono font-bold text-yellow-500 mb-2">🔍 ZIP Code Search</h3>
              <p className="font-mono text-sm text-muted-foreground">Look up tax rates by entering any US or Canada ZIP/postal code</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 border border-border">
              <h3 className="font-mono font-bold text-purple-500 mb-2">🏙️ City Search</h3>
              <p className="font-mono text-sm text-muted-foreground">Search by city name and state/province</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 border border-border">
              <h3 className="font-mono font-bold text-pink-500 mb-2">🧮 Tax Calculator</h3>
              <p className="font-mono text-sm text-muted-foreground">Calculate final prices including tax instantly</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 border border-border">
              <h3 className="font-mono font-bold text-cyan-500 mb-2">🌍 Offline Support</h3>
              <p className="font-mono text-sm text-muted-foreground">Access cached tax data even without internet connection</p>
            </div>
          </div>
        </section>

        {/* Getting Started */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 font-mono text-foreground">
            <span className="text-blue-500">$</span> Getting Started
          </h2>
          <div className="bg-muted/50 rounded-lg p-6 font-mono text-sm space-y-4">
            <div>
              <p className="text-green-500 mb-2">{'// Adding a widget to your home screen:'}</p>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground pl-4">
                <li>Long press on your home screen</li>
                <li>Tap the <span className="text-blue-400">+</span> button in the top left</li>
                <li>Search for <span className="text-green-400">"Sales Tax"</span></li>
                <li>Select the widget size (Small, Medium, or Large)</li>
                <li>Tap <span className="text-blue-400">"Add Widget"</span></li>
                <li>Long press the widget to configure location settings</li>
              </ol>
            </div>
            <div>
              <p className="text-green-500 mb-2">{'// Configuring widget mode:'}</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4">
                <li><span className="font-bold">Fixed Location:</span> Set a specific location that never changes</li>
                <li><span className="font-bold">Auto Location:</span> Widget updates based on your current GPS position</li>
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 font-mono text-foreground">
            <span className="text-yellow-500">?</span> Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "Why isn't my widget updating?",
                a: "Widgets may take a few minutes to update after first installation. Try removing and re-adding the widget, or restart your device. iOS controls widget refresh intervals to preserve battery life."
              },
              {
                q: "Why does the app need location permission?",
                a: "Location permission is only required for auto-location mode to fetch tax rates for your current position. If you use fixed location mode, you don't need to grant location access."
              },
              {
                q: "How accurate is the tax rate data?",
                a: "Tax rates are regularly updated from official sources. However, for important transactions, we recommend verifying the current rate with local authorities as rates can change."
              },
              {
                q: "How does offline mode work?",
                a: "The app caches tax rate data for 30 days. When offline, you can access any previously searched locations. The cache automatically refreshes when you're back online."
              },
              {
                q: "How do I remove ads?",
                a: "Go to Settings in the app and purchase the Pro version for $0.99 (one-time payment). This permanently removes all ads across all your devices using the same Apple ID."
              },
              {
                q: "How do I restore my purchase on a new device?",
                a: "Open the app, go to Settings, and tap 'Restore Purchase'. Sign in with the same Apple ID you used for the original purchase."
              },
              {
                q: "What devices are supported?",
                a: "The app requires iOS 16.0 or later and works on all iPhone models. iPad support is coming in a future update."
              },
              {
                q: "Does the app work in Canada?",
                a: "Yes! The app supports Canadian postal codes and displays GST, PST, HST, and combined tax rates for all provinces and territories."
              },
              {
                q: "Can I see the breakdown of tax components?",
                a: "Yes, tap on any search result to see the detailed breakdown including state/province, county, city, and special district taxes."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-muted/50 rounded-lg p-4 border border-border">
                <h3 className="font-mono font-bold text-green-500 mb-2">Q: {faq.q}</h3>
                <p className="font-mono text-sm text-muted-foreground pl-4">
                  <span className="text-blue-400">A:</span> {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Troubleshooting */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 font-mono text-foreground">
            <span className="text-red-500">!</span> Troubleshooting
          </h2>
          <div className="bg-muted/50 rounded-lg p-6 font-mono text-sm space-y-4">
            <div>
              <p className="text-red-500 font-bold mb-2">Widget shows "No Data" or error</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-4">
                <li>Check your internet connection</li>
                <li>Verify location services are enabled (for auto-location mode)</li>
                <li>Try removing and re-adding the widget</li>
                <li>Ensure you're in a supported region (US or Canada)</li>
              </ul>
            </div>
            <div>
              <p className="text-red-500 font-bold mb-2">Search returns no results</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-4">
                <li>Verify ZIP/postal code is correct</li>
                <li>For city search, include the state/province</li>
                <li>Check your network connection</li>
              </ul>
            </div>
            <div>
              <p className="text-red-500 font-bold mb-2">Purchase failed or not recognized</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-4">
                <li>Check your Apple ID payment method</li>
                <li>Try tapping "Restore Purchase" in Settings</li>
                <li>Restart the app and check again</li>
                <li>Contact Apple Support if the issue persists</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Privacy & Terms */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 font-mono text-foreground">
            <span className="text-purple-500">🔒</span> Privacy & Security
          </h2>
          <div className="bg-muted/50 rounded-lg p-6 font-mono text-sm space-y-3 text-muted-foreground">
            <p>
              <span className="text-green-500">✓</span> We do not collect or store personal information
            </p>
            <p>
              <span className="text-green-500">✓</span> Location data is only used to fetch tax rates and is not transmitted to third parties
            </p>
            <p>
              <span className="text-green-500">✓</span> Search history is stored locally on your device only
            </p>
            <p>
              <span className="text-green-500">✓</span> All data transmission uses encrypted HTTPS connections
            </p>
            <p>
              <span className="text-green-500">✓</span> No tracking or analytics beyond Apple's standard App Store metrics
            </p>
          </div>
        </section>

        {/* System Requirements */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 font-mono text-foreground">
            <span className="text-cyan-500">⚙️</span> System Requirements
          </h2>
          <div className="bg-muted/50 rounded-lg p-6 font-mono text-sm">
            <div className="grid gap-3">
              <div className="flex items-start gap-3">
                <span className="text-blue-400 font-bold min-w-[120px]">Platform:</span>
                <span className="text-muted-foreground">iOS 16.0 or later</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-400 font-bold min-w-[120px]">Devices:</span>
                <span className="text-muted-foreground">iPhone (all models supporting iOS 16+)</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-400 font-bold min-w-[120px]">Storage:</span>
                <span className="text-muted-foreground">~10 MB</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-400 font-bold min-w-[120px]">Network:</span>
                <span className="text-muted-foreground">Internet connection required for first use and data updates</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-400 font-bold min-w-[120px]">Permissions:</span>
                <span className="text-muted-foreground">Location (optional, for auto-location feature)</span>
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 font-mono text-foreground">
            <span className="text-green-500">@</span> Contact & Support
          </h2>
          <div className="bg-muted/50 rounded-lg p-6 font-mono text-sm space-y-4">
            <p className="text-muted-foreground mb-4">
              Need help? Have feedback? We'd love to hear from you!
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-blue-400">📧 Email:</span>
                <a href="mailto:luka@pzhng.com" className="text-green-500 hover:underline">
                  luka@pzhng.com
                </a>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-blue-400">🌐 Website:</span>
                <a href="https://pzhng.com" className="text-green-500 hover:underline">
                  pzhng.com
                </a>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-blue-400">📱 App Store:</span>
                <span className="text-muted-foreground">Search "Sales Tax Assistant"</span>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-muted-foreground text-xs">
                <span className="text-yellow-500">Note:</span> For purchase issues, please contact Apple Support directly through the App Store app.
              </p>
            </div>
          </div>
        </section>

        {/* Footer Note */}
        <div className="border-t border-border pt-6 text-center">
          <p className="font-mono text-sm text-muted-foreground">
            <span className="text-blue-400">const</span> <span className="text-yellow-400">version</span> = <span className="text-green-400">"1.0.0"</span>;{' '}
            <span className="text-gray-500">{'// Updated January 2025'}</span>
          </p>
          <p className="font-mono text-xs text-muted-foreground mt-2">
            Built with ❤️ using native iOS frameworks
          </p>
        </div>
      </Container>
    </div>
  )
}
