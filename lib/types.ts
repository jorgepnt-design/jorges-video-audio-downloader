export type MediaType = "video" | "audio";
export type Platform = "YouTube" | "Instagram" | "TikTok" | "X/Twitter" | "Facebook" | "Unbekannt";

export type VideoInfo = {
  title: string;
  sourceUrl: string;
  platform: Platform;
  thumbnail: string;
  duration: number | null;
  fileType: string;
  downloadOptions: string[];
};

export type GalleryItem = {
  id: string;
  title: string;
  sourceUrl: string;
  platform: Platform;
  type: MediaType;
  thumbnail: string;
  filePath: string;
  downloadUrl?: string;
  viewUrl?: string;
  createdAt: string;
  duration: number | null;
};
