import { Header } from "@/components/header";

// Shared by the signed-in pages so the header survives navigation between
// them: each route's `loading.tsx` swaps in below it rather than replacing
// the whole screen. The group adds no URL segment.
export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
