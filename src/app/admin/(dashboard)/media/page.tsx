import { getAllMedia } from "@/lib/data/settings";
import { MediaClient } from "./media-client";

export default async function MediaPage() {
  const media = await getAllMedia();
  return <MediaClient media={media} />;
}
