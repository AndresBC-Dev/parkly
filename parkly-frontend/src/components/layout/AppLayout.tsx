import { ReactNode } from "react";
import { Bell, Search, Plus, MessageCircle } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckInDialog } from "@/components/checkin/CheckInDialog";
import { GlobalSearch } from "./GlobalSearch";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />

        <div className="flex flex-1 flex-col min-w-0">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            <GlobalSearch />

            <div className="ml-auto flex items-center gap-2">
              <CheckInDialog
                trigger={
                  <Button size="sm" className="gap-1.5 shadow-sm">
                    <Plus className="h-3.5 w-3.5" />
                    Quick Entry
                  </Button>
                }
              />
              <Button
                variant="ghost"
                size="icon"
                className="relative h-9 w-9 text-muted-foreground hover:text-foreground"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary" />
              </Button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto">{children}</main>
          
          {/* WhatsApp Floating Button */}
          <a
            href="https://wa.me/1234567890"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
            title="Soporte WhatsApp"
          >
            <MessageCircle className="h-6 w-6" />
          </a>
        </div>
      </div>
    </SidebarProvider>
  );
}
