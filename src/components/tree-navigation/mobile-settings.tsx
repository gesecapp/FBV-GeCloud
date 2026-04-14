import { useNavigate } from '@tanstack/react-router';
import { LogOut, Settings2 } from 'lucide-react';
import { useState } from 'react';
import { ThemeSwitcher } from '@/components/sidebar/switch-theme';
import { Button } from '@/components/ui/button';
import { ItemTitle } from '@/components/ui/item';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useAppAuth } from '@/hooks/use-app-auth';

export function MobileSettings() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { clearAuth } = useAppAuth();

  function handleLogout() {
    setOpen(false);
    clearAuth();
    navigate({ to: '/app-auth' });
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="icon" className="size-12 shrink-0">
          <Settings2 className="size-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="flex flex-col gap-6 rounded-t-xl p-4 pb-10 sm:max-w-none">
        <SheetHeader className="text-left">
          <SheetTitle>Configurações</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <ItemTitle>Tema</ItemTitle>
            <ThemeSwitcher />
          </div>

          <div className="flex items-center justify-between">
            <ItemTitle>Sair da conta</ItemTitle>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
