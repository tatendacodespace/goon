import React from 'react';

const PrivacyPolicy = () => (
  <div className="min-h-screen bg-background text-white p-8 font-mono max-w-3xl mx-auto">
    <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
    <p className="mb-4">Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information when you use Goon Leaderboard.</p>
    <h2 className="text-xl font-semibold mt-6 mb-2">Information We Collect</h2>
    <ul className="list-disc ml-6 mb-4">
      <li>Username and password for account creation</li>
      <li>Session data (duration, date, notes)</li>
      <li>Usage statistics (for leaderboard and stats)</li>
    </ul>
    <h2 className="text-xl font-semibold mt-6 mb-2">How We Use Your Information</h2>
    <ul className="list-disc ml-6 mb-4">
      <li>To provide and improve the leaderboard and stats features</li>
      <li>To personalize your experience</li>
      <li>To maintain the security of your account</li>
    </ul>
    <h2 className="text-xl font-semibold mt-6 mb-2">Third-Party Services</h2>
    <p className="mb-4">We may use third-party services (such as ad networks) that may collect anonymous usage data. We do not sell or share your personal information with third parties.</p>
    <h2 className="text-xl font-semibold mt-6 mb-2">Your Rights</h2>
    <p className="mb-4">You can request deletion of your account and data at any time by contacting support.</p>
    <h2 className="text-xl font-semibold mt-6 mb-2">Contact</h2>
    <p>If you have any questions about this Privacy Policy, please contact us via the support form on the site.</p>
  </div>
);

export default PrivacyPolicy;
