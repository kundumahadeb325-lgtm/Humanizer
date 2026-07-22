import type { Metadata } from "next";
import Workspace from "@/components/Workspace";

export const metadata: Metadata = {
  title: "Editor",
  description: "Rewrite a draft into formal, plain, professional prose and check its facts.",
};

export default function HumanizePage() {
  return <Workspace />;
}
