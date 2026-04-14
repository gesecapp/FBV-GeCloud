import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Menu } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ItemTitle } from '@/components/ui/item';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { TreeProvider, TreeView } from '@/components/ui/tree';
import { buildSidebarRoutes } from '@/config/sidebarRoutes';
import { MobileSettings } from './mobile-settings';
import { renderTreeNodes } from './tree-nodes';

export function TreeNavigation() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const sidebarRoutes = useMemo(() => buildSidebarRoutes(), []);

  function handleNavigate(path: string) {
    navigate({ to: path });
    setOpen(false);
  }

  function handleBack() {
    window.history.back();
  }

  return (
    <div className="flex w-full gap-2 pb-4">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="default" className="h-12 flex-1 rounded-xl">
            <Menu className="size-4" />
            <ItemTitle className="text-lg">Menu</ItemTitle>
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="flex max-h-[85vh] flex-col rounded-t-xl p-0 sm:max-w-none">
          <SheetHeader className="border-b px-4 py-3 text-left">
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-2 py-4 pb-8">
            <TreeProvider animateExpand>
              <TreeView>{renderTreeNodes(sidebarRoutes, handleNavigate)}</TreeView>
            </TreeProvider>
          </div>
        </SheetContent>
      </Sheet>

      <Button variant="outline" onClick={handleBack}>
        <ArrowLeft className="size-4" />
        Voltar
      </Button>

      <MobileSettings />
    </div>
  );
}
