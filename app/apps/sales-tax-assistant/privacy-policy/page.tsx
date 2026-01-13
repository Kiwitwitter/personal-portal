/* eslint-disable react/no-unescaped-entities */
import { Metadata } from 'next'
import { Container } from '@/components/ui/Container'

export const metadata: Metadata = {
  title: 'Privacy Policy - Sales Tax Assistant | Peng Zhang',
  description: 'Privacy Policy for Sales Tax Assistant iOS app. Learn how we protect your data and privacy.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="py-16">
      <Container>
        {/* Header */}
        <div className="mb-12 border-b border-border pb-6">
          <div className="flex items-center gap-2 font-mono text-sm text-muted-foreground mb-4">
            <span className="text-green-500">$</span>
            <span>cat ./apps/sales-tax-assistant/PRIVACY.md</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4 font-mono">Privacy Policy</h1>
          <p className="text-lg text-muted-foreground font-mono">
            <span className="text-blue-400">Sales Tax Assistant</span> - Last Updated: January 13, 2025
          </p>
        </div>

        {/* Introduction */}
        <section className="mb-12">
          <div className="bg-muted/50 rounded-lg p-6 font-mono text-sm">
            <p className="mb-4">
              This Privacy Policy describes how Sales Tax Assistant ("we", "our", or "the app") collects, uses, and protects your information when you use our iOS application.
            </p>
            <p className="text-muted-foreground">
              <span className="text-green-500">TL;DR:</span> We don't collect, store, or share your personal information. Your data stays on your device.
            </p>
          </div>
        </section>

        {/* Information We Collect */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 font-mono text-foreground">
            <span className="text-blue-500">1.</span> Information We Collect
          </h2>

          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-6 border border-border">
              <h3 className="font-mono font-bold text-green-500 mb-3">Location Data (Optional)</h3>
              <div className="font-mono text-sm text-muted-foreground space-y-2">
                <p><span className="text-blue-400">Purpose:</span> To fetch sales tax rates for your current location when using the auto-location widget feature.</p>
                <p><span className="text-blue-400">Usage:</span> Location data is only used to query tax rates from our API. It is not stored, logged, or transmitted to any third parties.</p>
                <p><span className="text-blue-400">Control:</span> You can choose not to grant location permission. The app will still function fully using ZIP code or city search.</p>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-6 border border-border">
              <h3 className="font-mono font-bold text-green-500 mb-3">Search History</h3>
              <div className="font-mono text-sm text-muted-foreground space-y-2">
                <p><span className="text-blue-400">Storage:</span> Recent searches (ZIP codes, cities) are stored locally on your device only.</p>
                <p><span className="text-blue-400">Purpose:</span> To provide quick access to frequently searched locations.</p>
                <p><span className="text-blue-400">Access:</span> This data never leaves your device and is not accessible to us or any third party.</p>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-6 border border-border">
              <h3 className="font-mono font-bold text-green-500 mb-3">Tax Rate Cache</h3>
              <div className="font-mono text-sm text-muted-foreground space-y-2">
                <p><span className="text-blue-400">Storage:</span> Tax rate data is cached locally for 30 days to enable offline functionality.</p>
                <p><span className="text-blue-400">Purpose:</span> To allow the app to work without an internet connection.</p>
                <p><span className="text-blue-400">Data:</span> Only tax rate information (percentages, jurisdiction names) is cached, no personal data.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Information We Do NOT Collect */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 font-mono text-foreground">
            <span className="text-red-500">2.</span> Information We Do NOT Collect
          </h2>

          <div className="bg-muted/50 rounded-lg p-6 font-mono text-sm">
            <div className="space-y-3 text-muted-foreground">
              <p><span className="text-red-500">✗</span> We do not collect or store personal identification information</p>
              <p><span className="text-red-500">✗</span> We do not track your location history</p>
              <p><span className="text-red-500">✗</span> We do not use analytics or tracking services</p>
              <p><span className="text-red-500">✗</span> We do not collect device identifiers for advertising</p>
              <p><span className="text-red-500">✗</span> We do not share your data with third parties</p>
              <p><span className="text-red-500">✗</span> We do not sell your information to anyone</p>
            </div>
          </div>
        </section>

        {/* How We Use Your Information */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 font-mono text-foreground">
            <span className="text-green-500">3.</span> How We Use Your Information
          </h2>

          <div className="bg-muted/50 rounded-lg p-6 font-mono text-sm space-y-4">
            <div>
              <p className="text-green-500 mb-2">Location data is used solely to:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-4">
                <li>Query current sales tax rates from our backend API</li>
                <li>Display relevant tax information in the widget</li>
              </ul>
            </div>
            <div>
              <p className="text-green-500 mb-2">All data processing occurs:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-4">
                <li>Locally on your device</li>
                <li>Through secure HTTPS connections to our API</li>
                <li>Without logging or permanent storage on our servers</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Third-Party Services */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 font-mono text-foreground">
            <span className="text-purple-500">4.</span> Third-Party Services
          </h2>

          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-6 border border-border">
              <h3 className="font-mono font-bold text-purple-500 mb-3">Apple App Store</h3>
              <p className="font-mono text-sm text-muted-foreground">
                The app uses Apple's App Store for distribution and in-app purchases. Apple may collect standard analytics data as described in their privacy policy. We do not have access to this data.
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-6 border border-border">
              <h3 className="font-mono font-bold text-purple-500 mb-3">Tax Rate API</h3>
              <p className="font-mono text-sm text-muted-foreground">
                The app connects to our backend API (tax.pzhng.com) to retrieve tax rate information. API requests contain only the location data necessary to fetch relevant tax rates. No personal information or device identifiers are transmitted.
              </p>
            </div>
          </div>
        </section>

        {/* Data Security */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 font-mono text-foreground">
            <span className="text-yellow-500">5.</span> Data Security
          </h2>

          <div className="bg-muted/50 rounded-lg p-6 font-mono text-sm space-y-3 text-muted-foreground">
            <p>
              <span className="text-green-500">✓</span> All network communications use encrypted HTTPS connections
            </p>
            <p>
              <span className="text-green-500">✓</span> Data is stored locally using iOS secure storage mechanisms
            </p>
            <p>
              <span className="text-green-500">✓</span> We follow Apple's security best practices for iOS development
            </p>
            <p>
              <span className="text-green-500">✓</span> No data is transmitted to external servers except for tax rate queries
            </p>
          </div>
        </section>

        {/* In-App Purchases */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 font-mono text-foreground">
            <span className="text-cyan-500">6.</span> In-App Purchases
          </h2>

          <div className="bg-muted/50 rounded-lg p-6 font-mono text-sm text-muted-foreground">
            <p className="mb-4">
              The app offers a one-time in-app purchase to remove ads. All purchase transactions are processed securely through Apple's App Store payment system.
            </p>
            <div className="border-l-2 border-cyan-500 pl-4 space-y-2">
              <p>• We do not collect or store payment information</p>
              <p>• We do not have access to your financial data</p>
              <p>• Purchase receipts are verified with Apple's servers</p>
              <p>• Your purchase status is stored locally on your device</p>
            </div>
          </div>
        </section>

        {/* Children's Privacy */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 font-mono text-foreground">
            <span className="text-pink-500">7.</span> Children's Privacy
          </h2>

          <div className="bg-muted/50 rounded-lg p-6 font-mono text-sm text-muted-foreground">
            <p className="mb-4">
              Our app does not knowingly collect personal information from children under 13. The app is designed for general audiences and does not contain content specifically targeted at children.
            </p>
            <p>
              If you believe we have inadvertently collected information from a child under 13, please contact us immediately at <a href="mailto:luka@pzhng.com" className="text-green-500 hover:underline">luka@pzhng.com</a>.
            </p>
          </div>
        </section>

        {/* Your Rights */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 font-mono text-foreground">
            <span className="text-orange-500">8.</span> Your Rights
          </h2>

          <div className="bg-muted/50 rounded-lg p-6 font-mono text-sm space-y-4">
            <div>
              <p className="text-green-500 mb-2">You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4">
                <li><span className="font-bold">Access:</span> Since all data is stored locally on your device, you have full access to it</li>
                <li><span className="font-bold">Delete:</span> You can delete all app data by uninstalling the app or clearing app data in iOS Settings</li>
                <li><span className="font-bold">Control:</span> You can revoke location permissions at any time in iOS Settings</li>
                <li><span className="font-bold">Opt-out:</span> Simply don't grant location permission to prevent any location data usage</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Changes to Privacy Policy */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 font-mono text-foreground">
            <span className="text-blue-500">9.</span> Changes to This Privacy Policy
          </h2>

          <div className="bg-muted/50 rounded-lg p-6 font-mono text-sm text-muted-foreground">
            <p className="mb-4">
              We may update this Privacy Policy from time to time. We will notify you of any changes by:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-4 mb-4">
              <li>Updating the "Last Updated" date at the top of this policy</li>
              <li>Posting the new policy on this page</li>
              <li>Providing an in-app notification for significant changes</li>
            </ul>
            <p>
              You are advised to review this Privacy Policy periodically for any changes. Continued use of the app after changes constitutes acceptance of the updated policy.
            </p>
          </div>
        </section>

        {/* Contact Information */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 font-mono text-foreground">
            <span className="text-green-500">10.</span> Contact Us
          </h2>

          <div className="bg-muted/50 rounded-lg p-6 font-mono text-sm space-y-4">
            <p className="text-muted-foreground">
              If you have any questions, concerns, or requests regarding this Privacy Policy or your data, please contact us:
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
                <span className="text-blue-400">📱 Support Page:</span>
                <a href="https://pzhng.com/apps/sales-tax-assistant" className="text-green-500 hover:underline">
                  pzhng.com/apps/sales-tax-assistant
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Legal */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 font-mono text-foreground">
            <span className="text-gray-500">11.</span> Legal Compliance
          </h2>

          <div className="bg-muted/50 rounded-lg p-6 font-mono text-sm text-muted-foreground space-y-4">
            <p>
              This Privacy Policy is designed to comply with:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-4">
              <li>Apple App Store Review Guidelines</li>
              <li>California Consumer Privacy Act (CCPA)</li>
              <li>General Data Protection Regulation (GDPR) where applicable</li>
              <li>Other applicable privacy and data protection laws</li>
            </ul>
          </div>
        </section>

        {/* Footer */}
        <div className="border-t border-border pt-6">
          <div className="bg-muted/50 rounded-lg p-6 font-mono text-sm text-center">
            <p className="text-muted-foreground mb-2">
              <span className="text-blue-400">const</span> <span className="text-yellow-400">lastUpdated</span> = <span className="text-green-400">"2025-01-13"</span>;
            </p>
            <p className="text-xs text-muted-foreground">
              © 2025 Sales Tax Assistant. All rights reserved.
            </p>
          </div>
        </div>
      </Container>
    </div>
  )
}
