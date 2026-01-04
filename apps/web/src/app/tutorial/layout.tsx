import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | Tutorial | BrennerBot",
    default: "Tutorial | BrennerBot",
  },
  description: "Learn to apply the Brenner Method with guided learning paths.",
};

export default function TutorialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
