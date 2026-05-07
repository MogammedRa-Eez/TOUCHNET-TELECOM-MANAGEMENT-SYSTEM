/**
 * PageShell — consistent page wrapper with animated entrance for all admin pages.
 * Wraps page content with padding, max-width, spacing, and staggered slide-in animation.
 */
import React from "react";

export default function PageShell({ children, className = "" }) {
  return (
    <div className={`p-4 lg:p-8 space-y-5 max-w-[1600px] mx-auto section-reveal ${className}`}>
      {children}
    </div>
  );
}