import { useNavigate } from '@tanstack/react-router';
import { Cog, LogOut } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useAppAuth } from '@/hooks/use-app-auth';

export function MobileSettings() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { clearAuth } = useAppAuth();
  const { theme, setTheme } = useTheme();

  function handleLogout() {
    setOpen(false);
    clearAuth();
    navigate({ to: '/app-auth' });
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="icon" className="size-12 shrink-0">
          <Cog className="size-4" />
        </Button>
      </SheetTrigger>

      <SheetContent side="bottom" className="flex flex-col gap-6 rounded-t-xl p-4 pb-10 sm:max-w-none">
        <SheetHeader className="text-left">
          <SheetTitle>Configurações</SheetTitle>
        </SheetHeader>

        <div className="flex justify-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" className="h-auto min-w-24 flex-col gap-1 px-4 py-3" aria-label="Alterar tema">
                <Cog className="size-5" />
                <span className="text-xs">Tema</span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="center">
              <DropdownMenuItem onClick={() => setTheme('system')} className={theme === 'system' ? 'bg-accent font-medium' : ''}>
                Sistema {theme === 'system' && '✓'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('light')} className={theme === 'light' ? 'bg-accent font-medium' : ''}>
                Claro {theme === 'light' && '✓'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')} className={theme === 'dark' ? 'bg-accent font-medium' : ''}>
                Escuro {theme === 'dark' && '✓'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('sunset')} className={theme === 'sunset' ? 'bg-accent font-medium' : ''}>
                Sunset {theme === 'sunset' && '✓'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('ocean-blue')} className={theme === 'ocean-blue' ? 'bg-accent font-medium' : ''}>
                Ocean Blue {theme === 'ocean-blue' && '✓'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="default" className="h-auto min-w-24 flex-col gap-1 px-4 py-3" onClick={handleLogout} aria-label="Sair da conta">
            <LogOut className="size-5" />
            <span className="text-xs">Sair da conta</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
