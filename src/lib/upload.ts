/**
 * The image rules cliptech-api enforces, mirrored so a file that would be
 * rejected is caught before it is sent.
 *
 * Both numbers come from internal/storage: MaxImageSize is 5 << 20, and
 * allowedImageContentTypes is exactly these three. ValidateImage() remains the
 * authority - this only saves a creator from waiting on an upload that was
 * always going to 400, and it is why the messages here are specific.
 */

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** Also the right value for an <input type="file"> accept attribute. */
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export const ACCEPTED_IMAGE_ACCEPT_ATTR = ACCEPTED_IMAGE_TYPES.join(",");

/** The reason this file would be refused, or null if it is fine. */
export function imageRejectionReason(file: File): string | null {
  if (!(ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return "Pick a JPEG, PNG or WebP image.";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "That image is larger than 5 MB.";
  }
  return null;
}
