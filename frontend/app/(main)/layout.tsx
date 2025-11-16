import MainLayout from "@/components/layout/MainLayout";

// Force dynamic rendering for all main pages
export const dynamic = 'force-dynamic';

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout>
      {children}
    </MainLayout>
  );
}
