import React from 'react';

/**
 * Auth background — dark desk photo with:
 * - Highly optimized slow Ken Burns zoom (hardware accelerated)
 * - Pure black edge vignette
 * (Removed complex particles to eliminate rendering lag)
 */
export default function AuthBackground() {
  return (
    <div className="auth-bg-container" aria-hidden="true">
      {/* Photo with Ken Burns zoom */}
      <div className="auth-bg-photo" />

      {/* Pure black vignette */}
      <div className="auth-bg-vignette" />
    </div>
  );
}
