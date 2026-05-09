import { Metadata } from "next";
import { DocsContent } from "@/components/docs/DocsContent";

export const metadata: Metadata = {
  title: "Documentation — Mosaic ERP Builder",
  description:
    "Learn how to build your own custom ERP using Mosaic. Step-by-step guides for modules, plugins, blocks, and schema design.",
};

export default function DocsPage() {
  return <DocsContent />;
}
