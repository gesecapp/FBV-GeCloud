import { createFileRoute, redirect } from '@tanstack/react-router';
import { ArrowLeft, Copy } from 'lucide-react';
import { useState } from 'react';
import QRCode from 'react-qr-code';
import { toast } from 'sonner';
import { ThemeSwitcher } from '@/components/nav-actions/switch-theme';
import { TreeNavigation } from '@/components/tree-navigation';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ItemDescription } from '@/components/ui/item';
import { useAccessUserApi } from '@/hooks/use-access-user-api';
import { useAppAuth } from '@/hooks/use-app-auth';
import type { CreateGuestProps } from '@/routes/_private/access-user/@interface/access-user.interface';
import { VisitorForm } from './@components/visitor-form';
import { INVITATION_URL_BASE, WHATSAPP_COLOR, WHATSAPP_MESSAGE_PREFIX } from './@consts/add-visitor.consts';
import { addVisitorSearchSchema } from './@interface/add-visitor.schema';

export const Route = createFileRoute('/_private/visitors/add/')({
  validateSearch: addVisitorSearchSchema,
  beforeLoad: () => {
    const { isAuthenticated } = useAppAuth.getState();

    if (!isAuthenticated) {
      throw redirect({
        to: '/app-auth',
      });
    }
  },
  component: AddVisitorPage,
  staticData: { title: 'Visitante' },
});

function AddVisitorPage() {
  const { guestId } = Route.useSearch();
  const { userId } = useAppAuth();
  const { createGuest, updateGuest } = useAccessUserApi();

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [invitationLink, setInvitationLink] = useState('');

  function handleBack() {
    window.history.back();
  }

  function handleSubmit(data: CreateGuestProps & { id?: string }) {
    const payload = { ...data, user_type: 'visitante' as const };
    const hasPhoto = payload.url_image && payload.url_image.length > 0 && !!payload.url_image[0];

    if (data.id) {
      const { id, parentId, user_type, ...guestData } = payload;
      updateGuest.mutate(
        { id: data.id, guestData },
        {
          onSuccess: () => {
            toast.success('Visitante atualizado! As alterações podem levar alguns instantes para refletirem no sistema.');
            handleBack();
          },
          onError: (err: any) => {
            toast.error(err?.response?.data?.message || 'Erro ao atualizar visitante.');
          },
        },
      );
    } else {
      createGuest.mutate(payload, {
        onSuccess: (responseData) => {
          if (hasPhoto) {
            toast.success('Visitante cadastrado! Os dados podem levar alguns instantes para refletirem no sistema.');
            handleBack();
          } else if (responseData.id) {
            const url = `${INVITATION_URL_BASE}/${responseData.id}`;
            setInvitationLink(url);
            setShowInviteModal(true);
          }
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || 'Erro ao cadastrar visitante.');
        },
      });
    }
  }

  async function handleCopyUrl() {
    await navigator.clipboard.writeText(invitationLink);
    toast.success('Link copiado!');
  }

  function handleShareWhatsApp() {
    const message = encodeURIComponent(`${WHATSAPP_MESSAGE_PREFIX}${invitationLink}`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
  }

  return (
    <>
      <Card className="min-h-screen rounded-none border-none">
        <CardHeader>
          <CardTitle>{guestId ? 'Editar Visitante' : 'Novo Visitante'}</CardTitle>
          <CardAction>
            <ThemeSwitcher />

            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="size-4" />
              Voltar
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent>
          <VisitorForm parentId={userId || ''} guestId={guestId} onSubmit={handleSubmit} onCancel={handleBack} isLoading={createGuest.isPending || updateGuest.isPending} />
        </CardContent>

        <CardFooter>
          <TreeNavigation />
        </CardFooter>
      </Card>

      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent className="max-w-92 text-center">
          <DialogHeader>
            <DialogTitle>Pré-cadastro realizado com sucesso!</DialogTitle>
          </DialogHeader>
          <ItemDescription>Compartilhe o link abaixo para o visitante finalizar o cadastro e inserir a foto.</ItemDescription>
          <div className="mx-auto my-2 flex justify-center rounded-lg border border-slate-200 bg-white p-4">
            <QRCode value={invitationLink} size={160} />
          </div>
          <Input value={invitationLink} readOnly />
          <div className="flex justify-center gap-2">
            <Button onClick={handleCopyUrl} size="sm">
              <Copy className="mr-2 size-4" />
              Copiar Link
            </Button>
            <Button onClick={handleShareWhatsApp} size="sm" variant="outline" className={`bg-[${WHATSAPP_COLOR}] text-white hover:bg-[${WHATSAPP_COLOR}]/90`}>
              WhatsApp
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
