import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ItemDescription, ItemTitle } from '@/components/ui/item';

import { MoradorForm } from './@components/morador-form';
import { type RegisterMoradorPayload, useRegisterMorador } from './@hooks/use-register-morador-api';

export const Route = createFileRoute('/_public/register-morador/')({
  component: RegisterMoradorPage,
});

function RegisterMoradorPage() {
  const navigate = useNavigate();
  const registerMorador = useRegisterMorador();
  const [success, setSuccess] = useState(false);

  function handleSubmit(payload: RegisterMoradorPayload) {
    registerMorador.mutate(payload, {
      onSuccess: () => {
        setSuccess(true);
        toast.success('Cadastro realizado com sucesso!');
      },
    });
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-4 py-10">
            <ItemTitle className="text-emerald-600 text-xl">Cadastro Realizado!</ItemTitle>
            <ItemDescription className="text-center">Seu cadastro foi enviado com sucesso. Em breve você poderá acessar o aplicativo com seu CPF e senha.</ItemDescription>
            <Button variant="outline" onClick={() => navigate({ to: '/app-auth' })}>
              <ArrowLeft className="mr-2 size-4" />
              Voltar ao Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Novo Morador</CardTitle>
          <Button variant="outline" size="sm" onClick={() => navigate({ to: '/app-auth' })}>
            <ArrowLeft className="mr-2 size-4" />
            Voltar
          </Button>
        </CardHeader>
        <CardContent>
          <MoradorForm onSubmit={handleSubmit} isLoading={registerMorador.isPending} />
        </CardContent>
      </Card>
    </div>
  );
}
