import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SettingsView } from "@/components/screens/settings-view";
import { DETAIL_SECTIONS, SECTIONS, type SettingsSectionId } from "@/components/screens/settings-sections";

type Props = { params: Promise<{ section: string }> };

export function generateStaticParams() {
  return DETAIL_SECTIONS.map((section) => ({ section }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { section } = await params;
  return { title: SECTIONS.find((s) => s.id === section)?.label ?? "Settings" };
}

/** A Settings section: its own detail screen on mobile, the full Settings page scrolled to it from 768px up. */
export default async function SettingsSectionPage({ params }: Props) {
  const { section } = await params;
  if (!DETAIL_SECTIONS.includes(section as SettingsSectionId)) notFound();
  return <SettingsView section={section as SettingsSectionId} />;
}
