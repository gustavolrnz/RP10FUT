import { getSettings } from "@/lib/data/settings";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const settings = await getSettings();
  return <SettingsClient customizationFee={settings.customizationFee} />;
}
