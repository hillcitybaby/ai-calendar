import type { Metadata } from "next";

import { ConnectorsView } from "@/components/screens/connectors-view";

export const metadata: Metadata = { title: "Connectors & interests" };

export default function ConnectorsPage() {
  return <ConnectorsView />;
}
