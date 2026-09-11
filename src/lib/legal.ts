/**
 * The details every legal document needs, in one place.
 *
 * ─────────────────────────────────────────────────────────────────────────
 *  CONFIRM ALL OF THESE BEFORE LAUNCH.
 *
 *  They are placeholders written from what the codebase shows, not from
 *  anything authoritative. The registered entity, the address behind it, the
 *  support mailbox and the governing jurisdiction are business facts this
 *  repository has no way to know, and each one appears verbatim on a public
 *  page that an OAuth reviewer and a regulator may both read.
 * ─────────────────────────────────────────────────────────────────────────
 */
export const LEGAL = {
  /** Trading name, as it appears in the product. */
  product: "ClipTech",

  /** Registered legal entity that owns the product and is party to the terms. */
  entity: "ClipTech",

  /** Reachable mailbox. Named in the terms as the contact of record. */
  contactEmail: "support@cliptech.app",

  /** Jurisdiction whose law governs the terms and where disputes are heard. */
  governingLaw: "India",

  /**
   * Shown on every document, and the date a creator is agreeing to a version
   * from. Bump it whenever the text below materially changes.
   */
  effectiveDate: "3 September 2026",
} as const;

export const LEGAL_DOCUMENTS = [
  { href: "/legal/terms", title: "Terms of Service" },
  { href: "/legal/privacy", title: "Privacy Policy" },
  { href: "/legal/rules", title: "Campaign Rules" },
] as const;
