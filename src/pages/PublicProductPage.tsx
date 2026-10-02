import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  LuArrowLeft as ArrowLeft,
  LuCircleCheck as CheckCircle,
  LuLoaderCircle as Loader2,
  LuMapPin as MapPin,
  LuMessageCircle as MessageCircle,
  LuMinus as Minus,
  LuPackage as Package,
  LuPlus as Plus,
} from 'react-icons/lu';
import {
  publicProductsApi,
  type PublicProduct,
  type PublicReservation,
  type PublicShop,
} from '../infra/publicProductsApi';
import { ProductReservationSchema, type ProductReservationFormData } from '../schemas';
import { maskPhone, normalizePhoneBR } from '../utils/documentUtils';
import { getErrorMessage } from '../utils/errorMessage';
import { productMoney } from '../features/products/productMoney';
import { FIELD_CONTROL, FIELD_CONTROL_ERROR, Field } from '../components/ui/Field';
import { StatusBadge } from '../components/ui/StatusBadge';

const MAX_QUANTITY = 10;

/** Limita o seletor ao estoque disponível (null = sem controle de estoque). */
function availableLimit(product: PublicProduct | null): number {
  if (!product) return 1;
  if (product.available === null) return MAX_QUANTITY;
  return Math.max(0, Math.min(MAX_QUANTITY, Math.floor(product.available)));
}

function formatExpiresAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

function shopAddressLine(shop: PublicShop): string | null {
  if (!shop.address) return null;
  return `${shop.address}${shop.city ? `, ${shop.city}` : ''}`;
}

interface ShopActionsProps {
  mapUrl: string | null;
  whatsappUrl: string | null;
}

const ShopActions: React.FC<ShopActionsProps> = ({ mapUrl, whatsappUrl }) => (
  <>
    {mapUrl && (
      <a
        href={mapUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-bg px-4 py-3 text-sm font-bold text-text-primary transition-colors hover:border-accent/40"
      >
        <MapPin size={16} aria-hidden />
        Ver no mapa
      </a>
    )}
    {whatsappUrl && (
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-bg px-4 py-3 text-sm font-bold text-text-primary transition-colors hover:border-accent/40"
      >
        <MessageCircle size={16} aria-hidden />
        Falar no WhatsApp
      </a>
    )}
  </>
);

interface SuccessScreenProps {
  shop: PublicShop;
  reservation: PublicReservation;
  successMessage: string;
  mapUrl: string | null;
  whatsappUrl: string | null;
  onBack: () => void;
}

const SuccessScreen: React.FC<SuccessScreenProps> = ({
  shop,
  reservation,
  successMessage,
  mapUrl,
  whatsappUrl,
  onBack,
}) => (
  <main className="mx-auto max-w-md px-4 pt-6">
    <div className="rounded-2xl border border-accent/30 bg-surface p-5">
      <div className="mb-3 flex items-center gap-2 text-accent">
        <CheckCircle size={22} aria-hidden />
        <span className="font-bold">Reserva confirmada · {shop.name}</span>
      </div>
      <p className="text-sm leading-relaxed text-text-primary">{successMessage}</p>

      <div className="mt-4 flex items-center justify-between rounded-xl border border-border bg-bg px-3 py-2.5 text-sm">
        <span className="text-text-secondary">
          {reservation.quantity}× {reservation.productName}
        </span>
        <span className="font-bold">
          {productMoney.format(reservation.unitPrice * reservation.quantity)}
        </span>
      </div>

      <div className="mt-4 space-y-2">
        <ShopActions mapUrl={mapUrl} whatsappUrl={whatsappUrl} />
        <button
          type="button"
          onClick={onBack}
          className="w-full rounded-xl bg-accent px-4 py-3 text-sm font-bold text-accent-fg transition-colors hover:bg-accent-hover"
        >
          Voltar ao salão
        </button>
      </div>
    </div>
  </main>
);

interface ReservationFormProps {
  product: PublicProduct;
  maxQuantity: number;
  submitting: boolean;
  submitError: string | null;
  onReserve: (data: ProductReservationFormData) => void;
}

const ReservationForm: React.FC<ReservationFormProps> = ({
  product,
  maxQuantity,
  submitting,
  submitError,
  onReserve,
}) => {
  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProductReservationFormData>({
    resolver: zodResolver(ProductReservationSchema),
    defaultValues: { customerName: '', whatsapp: '', quantity: 1 },
  });
  const quantity = useWatch({ control, name: 'quantity' }) || 1;
  const whatsappValue = useWatch({ control, name: 'whatsapp' }) || '';
  const unavailable = maxQuantity <= 0;
  const quantityHint =
    product.available === null
      ? undefined
      : `Até ${product.available} ${product.unitLabel} disponível(is)`;

  return (
    <form
      onSubmit={handleSubmit(onReserve)}
      className="mt-4 space-y-4 rounded-2xl border border-border bg-surface p-5"
    >
      <h2 className="text-base font-bold">Reservar para retirada</h2>

      <Field label="Seu nome" error={errors.customerName?.message}>
        <input
          type="text"
          placeholder="Ex: João Silva"
          autoComplete="name"
          className={errors.customerName ? FIELD_CONTROL_ERROR : FIELD_CONTROL}
          {...register('customerName')}
        />
      </Field>

      <Field label="WhatsApp para contato" error={errors.whatsapp?.message}>
        <input
          type="tel"
          placeholder="(11) 99999-9999"
          autoComplete="tel"
          className={errors.whatsapp ? FIELD_CONTROL_ERROR : FIELD_CONTROL}
          value={whatsappValue}
          onChange={e =>
            setValue('whatsapp', maskPhone(e.target.value), { shouldValidate: true })
          }
        />
      </Field>

      <Field label="Quantidade" error={errors.quantity?.message} hint={quantityHint}>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Diminuir quantidade"
            disabled={unavailable || quantity <= 1}
            onClick={() =>
              setValue('quantity', Math.max(1, quantity - 1), { shouldValidate: true })
            }
            className={`${FIELD_CONTROL} flex w-12 items-center justify-center px-0 disabled:opacity-50`}
          >
            <Minus size={16} aria-hidden />
          </button>
          <span className="min-w-10 text-center text-base font-bold">{quantity}</span>
          <button
            type="button"
            aria-label="Aumentar quantidade"
            disabled={unavailable || quantity >= maxQuantity}
            onClick={() =>
              setValue('quantity', Math.min(maxQuantity, quantity + 1), { shouldValidate: true })
            }
            className={`${FIELD_CONTROL} flex w-12 items-center justify-center px-0 disabled:opacity-50`}
          >
            <Plus size={16} aria-hidden />
          </button>
        </div>
      </Field>

      {unavailable && (
        <p className="rounded-xl border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-text-primary">
          Este produto está sem estoque para reserva no momento.
        </p>
      )}

      {submitError && (
        <p className="rounded-xl border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
          {submitError}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting || unavailable}
        className="w-full rounded-xl bg-accent px-4 py-3.5 text-sm font-bold text-accent-fg transition-colors hover:bg-accent-hover disabled:opacity-60"
      >
        {submitting ? 'Reservando...' : 'Reservar produto'}
      </button>

      <p className="text-center text-[11px] leading-relaxed text-text-muted">
        A reserva é gratuita e não é um pagamento. O pagamento é feito na retirada. Informe seu nome ao chegar.
      </p>
    </form>
  );
};

export const PublicProductPage: React.FC = () => {
  const { id, productId } = useParams<{ id: string; productId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [shop, setShop] = useState<PublicShop | null>(null);
  const [product, setProduct] = useState<PublicProduct | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [reservation, setReservation] = useState<PublicReservation | null>(null);

  const maxQuantity = availableLimit(product);

  const backToShop = useCallback(() => navigate(`/queue/${id ?? ''}`), [navigate, id]);

  useEffect(() => {
    if (!id || !productId) return;
    let alive = true;
    publicProductsApi
      .get(id, productId)
      .then(res => {
        if (!alive) return;
        setShop(res.shop);
        setProduct(res.product);
      })
      .catch(err => {
        if (alive) setLoadError(getErrorMessage(err, 'Produto não encontrado.'));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [id, productId]);

  const onReserve = useCallback(
    async (data: ProductReservationFormData) => {
      if (!id || !productId) return;
      setSubmitting(true);
      setSubmitError(null);
      try {
        const res = await publicProductsApi.reserve(id, productId, {
          customerName: data.customerName,
          whatsapp: data.whatsapp,
          quantity: data.quantity,
        });
        setShop(res.shop);
        setReservation(res.reservation);
      } catch (err) {
        setSubmitError(
          getErrorMessage(err, 'Não foi possível reservar este produto. Tente novamente.')
        );
      } finally {
        setSubmitting(false);
      }
    },
    [id, productId]
  );

  const addressLine = shop ? shopAddressLine(shop) : null;

  const successMessage = useMemo(() => {
    if (!shop || !reservation) return '';
    const delivery = addressLine
      ? `Vá até ${addressLine} para fazer a retirada.`
      : 'Combine a retirada com o estabelecimento.';
    return `Produto reservado na ${shop.name}! ${delivery} Sua reserva fica separada até ${formatExpiresAt(reservation.expiresAt)}.`;
  }, [shop, reservation, addressLine]);

  const mapUrl = useMemo(() => {
    if (!addressLine) return null;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressLine)}`;
  }, [addressLine]);

  const whatsappUrl = useMemo(() => {
    const digits = shop?.whatsapp ? normalizePhoneBR(shop.whatsapp) : '';
    if (!digits) return null;
    return `https://wa.me/${digits.length <= 11 ? '55' : ''}${digits}`;
  }, [shop]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg text-text-muted">
        <Loader2 className="animate-spin" size={40} aria-label="Carregando produto" />
      </div>
    );
  }

  if (loadError || !product || !shop) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 px-6 text-center bg-bg text-text-primary">
        <Package className="mx-auto text-text-muted" size={40} aria-hidden />
        <div>
          <h1 className="text-lg font-bold">{loadError ?? 'Produto não encontrado'}</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Volte ao salão para conferir os outros produtos.
          </p>
        </div>
        <button
          type="button"
          onClick={backToShop}
          className="rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-accent-fg"
        >
          Voltar ao salão
        </button>
      </div>
    );
  }

  if (reservation) {
    return (
      <div className="min-h-screen bg-bg text-text-primary">
        <SuccessScreen
          shop={shop}
          reservation={reservation}
          successMessage={successMessage}
          mapUrl={mapUrl}
          whatsappUrl={whatsappUrl}
          onBack={backToShop}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <main className="mx-auto max-w-md px-4 pt-6">
        <button
          type="button"
          onClick={backToShop}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-bold text-text-secondary transition-colors hover:text-accent"
        >
          <ArrowLeft size={16} aria-hidden />
          Voltar ao salão
        </button>

        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="mb-3 flex h-36 items-center justify-center overflow-hidden rounded-xl bg-surface-2 text-text-muted">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <Package size={44} aria-hidden />
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold">{product.name}</h1>
            {product.available === 0 && <StatusBadge tone="danger">Esgotado</StatusBadge>}
          </div>
          <p className="mt-0.5 text-sm text-text-muted">{product.category ?? shop.name}</p>
          <p className="mt-3 text-2xl font-bold text-accent">
            {productMoney.format(product.price)}
            <span className="ml-1 text-sm font-medium text-text-muted">/ {product.unitLabel}</span>
          </p>

          {product.description && (
            <p className="mt-3 text-sm leading-relaxed text-text-secondary">
              {product.description}
            </p>
          )}

          <p className="mt-3 text-xs font-bold text-text-secondary">
            {product.available === null
              ? 'Sem limite de quantidade'
              : `Disponível: ${product.available} ${product.unitLabel}`}
          </p>
        </div>

        <ReservationForm
          product={product}
          maxQuantity={maxQuantity}
          submitting={submitting}
          submitError={submitError}
          onReserve={onReserve}
        />
      </main>
    </div>
  );
};

export default PublicProductPage;
