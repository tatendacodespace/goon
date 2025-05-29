import React from 'react';

const TermsOfService = () => (
  <div className="min-h-screen bg-background text-white p-8 font-mono max-w-3xl mx-auto">
    <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
    <p className="mb-4">By using Goon Leaderboard, you agree to the following terms:</p>
    <ul className="list-disc ml-6 mb-4">
      <li>You are at least 18 years old or have legal permission to use this site.</li>
      <li>You will not use the site for illegal or abusive purposes.</li>
      <li>You are responsible for keeping your account secure.</li>
      <li>We may update these terms at any time. Continued use means you accept the new terms.</li>
    </ul>
    <h2 className="text-xl font-semibold mt-6 mb-2">Disclaimer</h2>
    <p className="mb-4">This site is provided as-is, without warranties. We are not liable for any damages or losses from using the site.</p>
    <h2 className="text-xl font-semibold mt-6 mb-2">Contact</h2>
    <p>If you have questions about these terms, contact us via the support form on the site.</p>
  </div>
);

export default TermsOfService;
