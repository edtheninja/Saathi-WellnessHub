export async function shareToSocial({
  title,
  text,
  imageUrl,
}: {
  title: string;
  text: string;
  imageUrl?: string;
}) {
  // Modern mobile browsers
  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text,
        url: imageUrl,
      });
      return;
    } catch (err) {
      console.log("Share cancelled");
    }
  }

  // Fallback (desktop / unsupported)
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
    `${title}\n\n${text}\n\n${imageUrl ?? ""}`
  )}`;

  window.open(whatsappUrl, "_blank");
}