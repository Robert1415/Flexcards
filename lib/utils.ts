export const buildSnapshotFileName = (
  templateId: string,
  side: "front" | "back" = "front"
) => `snapshot-card-${templateId}${side === "back" ? "-back" : ""}.png`;

export const triggerDownload = (dataUrl: string, filename: string) => {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.click();
};
