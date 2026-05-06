import { ChevronsUpDownIcon, Loader2, XIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { type UnitySearchResult, useSearchUnities } from '../@hooks/use-register-morador-api';

interface UnitySearchInputProps {
  value: UnitySearchResult[];
  onChange: (next: UnitySearchResult[]) => void;
  disabled?: boolean;
}

export function UnitySearchInput({ value, onChange, disabled }: UnitySearchInputProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebounced(search), 300);
    return () => window.clearTimeout(timeout);
  }, [search]);

  const query = useSearchUnities(debounced, open);
  const results = query.data ?? [];

  function toggle(option: UnitySearchResult) {
    const exists = value.some((v) => v.id === option.id);
    onChange(exists ? value.filter((v) => v.id !== option.id) : [...value, option]);
  }

  function remove(id: string) {
    onChange(value.filter((v) => v.id !== id));
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" role="combobox" aria-expanded={open} disabled={disabled} className="w-full justify-between">
          <div className="flex flex-wrap items-center gap-1 pr-2.5">
            {value.length > 0 ? (
              value.map((unity) => (
                <Badge key={unity.id} variant="outline" className="rounded-sm">
                  {unity.block ? `${unity.block} — ${unity.identifier}` : unity.identifier}
                  <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    className="size-4"
                    onClick={(event) => {
                      event.stopPropagation();
                      remove(unity.id);
                    }}
                  >
                    <span>
                      <XIcon className="size-3" />
                    </span>
                  </Button>
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground">Buscar unidades</span>
            )}
          </div>
          <ChevronsUpDownIcon className="shrink-0 text-muted-foreground/80" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Digite para buscar..." value={search} onValueChange={setSearch} />
          <CommandList>
            {query.isFetching ? (
              <CommandEmpty>
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" /> Buscando...
                </span>
              </CommandEmpty>
            ) : debounced.trim().length === 0 ? (
              <CommandEmpty>Digite para buscar unidades.</CommandEmpty>
            ) : results.length === 0 ? (
              <CommandEmpty>Nenhuma unidade encontrada.</CommandEmpty>
            ) : (
              <CommandGroup>
                {results.map((unity) => {
                  const selected = value.some((v) => v.id === unity.id);
                  return (
                    <CommandItem key={unity.id} value={unity.id} onSelect={() => toggle(unity)}>
                      <span className="truncate">{unity.block ? `${unity.block} — ${unity.identifier}` : unity.identifier}</span>
                      {selected && <span className="ml-auto text-muted-foreground text-xs">selecionada</span>}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
