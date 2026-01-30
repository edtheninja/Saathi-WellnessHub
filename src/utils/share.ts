import html2canvas from "html2canvas";

export const shareProgress = async () => {
  const element = document.getElementById("share-card");
  if (!element) return;

  const canvas = await html2canvas(element);
  const blob = await (await fetch(canvas.toDataURL())).blob();

  const file = new File([blob], "saathi-progress.png", {
    type: "image/png",
  });

  if (navigator.share) {
    await navigator.share({
      files: [file],
      title: "My Wellness Journey",
      text: "Tracking my mental wellness with Saathi 🌱",
    });
  }
};
export async function shareProgressLink() {
  if (navigator.share) {
    await navigator.share({
      title: "My Saathi Journey",
      text: "Tracking my mental wellness with Saathi 💙",
      url: "https://saathi.app",
    });
  } else {
    alert("Sharing supported on mobile devices");
  }
}