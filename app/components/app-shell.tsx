import { Sidebar } from "./sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="w-48 xl:w-52 shrink-0">
        <Sidebar />
      </div>
      <div className="flex-1 w-full min-h-screen overflow-y-auto">
        {children}
      </div>
    </>
  );
}
