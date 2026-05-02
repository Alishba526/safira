import { ReactNode } from 'react';
import { Sidebar, MobileBottomNav, TopHeader } from './AppShell';

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <TopHeader />
      <MobileBottomNav />
      <main className="lg:ml-[70px] pt-14 pb-20 lg:pb-0">{children}</main>
    </div>
  );
};

export default Layout;
