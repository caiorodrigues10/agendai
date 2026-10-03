import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Service, StaffMember, ShopSettings } from '../../types';
import { AppointmentSchema, AppointmentFormData } from '../../schemas';
import {
  AvailabilitySlot,
  generateTimeSlots,
  getDaySchedule,
  isShopDayClosed,
  isSlotAvailable,
  addDays,
} from '../../utils/schedulingUtils';
import { maskPhone } from '../../utils/documentUtils';
import {
  LuCalendar as Calendar,
  LuUser as User,
  LuCircleCheck as CheckCircle,
  LuSmartphone as Smartphone,
  LuCircleAlert as AlertCircle,
  LuClock as Clock,
} from 'react-icons/lu';
import { DynamicIcon } from '../../components/ui/DynamicIcon';
import { ThemedCalendar, toLocalISO } from '../../components/ui/ThemedCalendar';
import { Avatar } from '../../components/ui/Avatar';
import type { PublicSaleProduct } from '../../infra/productsApi';

interface AppointmentSchedulerProps {
  services: Service[];
  staff: StaffMember[];
  settings: ShopSettings;
  occupancy?: AvailabilitySlot[];
  availableSlots?: string[];
  publicProducts?: PublicSaleProduct[];
  onBook: (data: any) => Promise<unknown>;
  onDateChange?: (date: string, staffId?: string, serviceId?: string) => void;
}

function firstOpenDate(settings: ShopSettings): string {
  const start = new Date();
  for (let i = 0; i < 14; i++) {
    const day = addDays(start, i);
    if (!isShopDayClosed(day, settings)) return toLocalISO(day);
  }
  return toLocalISO(start);
}

export const AppointmentScheduler: React.FC<AppointmentSchedulerProps> = ({
  services,
  staff,
  settings,
  occupancy = [],
  availableSlots,
  publicProducts = [],
  onBook,
  onDateChange,
}) => {
  const [bookingComplete, setBookingComplete] = useState(false);
  const [manageToken, setManageToken] = useState<string | null>(null);
  const [reservedProducts, setReservedProducts] = useState<Record<string, number>>({});

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(AppointmentSchema),
    defaultValues: {
      staffId: 'any',
      serviceId: '',
      date: firstOpenDate(settings),
      time: '',
      customerName: '',
      whatsapp: '',
    },
  });

  const selectedServiceId = watch('serviceId');
  const selectedStaffId = watch('staffId');
  const date = watch('date');
  const time = watch('time');

  const today = toLocalISO(new Date());
  const maxDate = toLocalISO(addDays(new Date(), 30));

  const onDateChangeRef = useRef(onDateChange);
  onDateChangeRef.current = onDateChange;

  useEffect(() => {
    if (date) onDateChangeRef.current?.(date, selectedStaffId !== 'any' ? selectedStaffId : undefined, selectedServiceId || undefined);
  }, [date, selectedStaffId, selectedServiceId]);

  const isDateClosed = useMemo(() => {
    if (!date) return false;
    return isShopDayClosed(new Date(date + 'T12:00:00'), settings);
  }, [date, settings]);

  const selectedService = services.find(s => s.id === selectedServiceId);

  const timeSlots = useMemo(() => {
    if (!date || isDateClosed) return [];

    const daySchedule = getDaySchedule(new Date(date + 'T12:00:00'), settings.schedule);
    if (!daySchedule?.isOpen) return [];

    if (availableSlots) return availableSlots;
    const slots = generateTimeSlots(daySchedule.openTime, daySchedule.closeTime);
    return slots.filter(slot => isSlotAvailable(slot, selectedStaffId, occupancy, staff.length));
  }, [date, isDateClosed, settings.schedule, selectedStaffId, occupancy, staff.length, availableSlots]);

  const dateLabel = date
    ? new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })
    : '';

  const selectedProducts = useMemo(
    () =>
      publicProducts
        .map(product => ({ product, quantity: reservedProducts[product.id] ?? 0 }))
        .filter(item => item.quantity > 0),
    [publicProducts, reservedProducts]
  );

  const reservedProductsTotal = selectedProducts.reduce(
    (sum, item) => sum + item.product.salePrice * item.quantity,
    0
  );

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const changeProductQuantity = (product: PublicSaleProduct, delta: number) => {
    setReservedProducts(current => {
      const currentQty = current[product.id] ?? 0;
      const stockLimit = product.trackStock ? Math.max(0, Math.floor(product.stockQty)) : 10;
      const nextQty = Math.max(0, Math.min(stockLimit, currentQty + delta, 10));
      const next = { ...current };
      if (nextQty === 0) delete next[product.id];
      else next[product.id] = nextQty;
      return next;
    });
  };

  const onSubmit = async (data: AppointmentFormData) => {
    const created = (await onBook({
      ...data,
      reservedProducts: selectedProducts.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
    })) as { manageToken?: string } | undefined;
    setManageToken(created?.manageToken ?? null);
    setBookingComplete(true);
  };

  const getEventDetails = () => {
    if (!selectedService || !date || !time) return null;
    const startTime = new Date(`${date}T${time}`);
    const endTime = new Date(startTime.getTime() + selectedService.avgTimeMinutes * 60000);
    return {
      start: startTime,
      end: endTime,
      title: `${selectedService.name} - ${settings.shopName}`,
      details: `Agendamento na ${settings.shopName}. Serviço: ${selectedService.name}`,
      location: [settings.shopName, settings.address].filter(Boolean).join(', '),
    };
  };

  const generateGoogleLink = () => {
    const evt = getEventDetails();
    if (!evt) return '#';
    const fmt = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, '');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(evt.title)}&dates=${fmt(evt.start)}/${fmt(evt.end)}&details=${encodeURIComponent(evt.details)}&location=${encodeURIComponent(evt.location)}`;
  };

  const openNativeCalendar = () => {
    const evt = getEventDetails();
    if (!evt) return;
    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Agende Já//Appointment//PT-BR',
      'BEGIN:VEVENT', `UID:${Date.now()}@agendai`, `DTSTART:${fmt(evt.start)}`, `DTEND:${fmt(evt.end)}`,
      `SUMMARY:${evt.title}`, `DESCRIPTION:${evt.details}`, `LOCATION:${evt.location}`,
      'END:VEVENT', 'END:VCALENDAR',
    ].join('\r\n');
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  };

  if (bookingComplete) {
    return (
      <div className="bg-surface border border-border rounded-xl p-8 text-center animate-fade-in">
        <div className="w-20 h-20 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} />
        </div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">Agendamento Confirmado!</h2>
        <p className="text-text-secondary mb-6">
          Te esperamos dia{' '}
          <span className="text-text-primary font-bold">
            {new Date(date + 'T12:00:00').toLocaleDateString('pt-BR')}
          </span>{' '}
          às <span className="text-text-primary font-bold">{time}</span>.
        </p>
        {selectedProducts.length > 0 && (
          <div className="mb-6 rounded-xl border border-border bg-bg p-4 text-left">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-text-muted">
              Produtos reservados
            </p>
            <div className="space-y-2">
              {selectedProducts.map(item => (
                <div key={item.product.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-text-primary">{item.product.name}</span>
                  <span className="shrink-0 text-text-secondary">
                    {item.quantity}x {formatCurrency(item.product.salePrice)}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-text-muted">
              O pagamento e confirmado direto no salao.
            </p>
          </div>
        )}
        <div className="space-y-3">
          <a
            href={generateGoogleLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 bg-surface-2 hover:bg-border-strong text-text-primary text-xs font-bold rounded-xl flex items-center justify-center gap-2 border border-border-strong"
          >
            <Calendar size={16} className="text-support" /> Adicionar ao Google Agenda
          </a>
          <button
            type="button"
            onClick={openNativeCalendar}
            className="w-full py-3 bg-surface-2 hover:bg-border-strong text-text-primary text-xs font-bold rounded-xl flex items-center justify-center gap-2 border border-border-strong"
          >
            <Calendar size={16} className="text-accent" /> Adicionar ao calendário
          </button>
          {manageToken && (
            <a
              href={`/agendamento/gerenciar#token=${encodeURIComponent(manageToken)}`}
              className="w-full py-3 bg-accent/10 hover:bg-accent/20 text-accent text-xs font-bold rounded-xl flex items-center justify-center gap-2 border border-accent/30"
            >
              Gerenciar agendamento
            </a>
          )}
          <button
            onClick={() => {
              setBookingComplete(false);
              setValue('serviceId', '');
              setReservedProducts({});
            }}
            className="mt-4 text-accent text-sm font-bold hover:underline"
          >
            Realizar novo agendamento
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-2xl animate-fade-in">
      <div className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* SEÇÃO 1: SERVIÇOS */}
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-lg font-bold text-text-primary mb-2 flex items-center gap-2">
              <CheckCircle size={18} className="text-accent" /> Selecione o Serviço
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {services.map(service => (
                <div
                  key={service.id}
                  onClick={() => setValue('serviceId', service.id, { shouldValidate: true })}
                  className={`cursor-pointer p-4 rounded-xl border transition-all relative overflow-hidden group flex items-center gap-4
                                ${
                                  selectedServiceId === service.id
                                    ? 'bg-selection border-accent/50 shadow-sm shadow-black/5'
                                    : 'bg-bg border-border hover:border-border-strong hover:bg-surface'
                                }
                            `}
                >
                  <div
                    className={`p-2.5 rounded-lg transition-colors ${selectedServiceId === service.id ? 'bg-accent/20 text-accent' : 'bg-surface text-text-muted group-hover:text-text-secondary'}`}
                  >
                    <DynamicIcon name={service.icon} size={24} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-text-primary text-base">{service.name}</h4>
                    <p className="text-xs text-text-muted font-medium">
                      ~{service.avgTimeMinutes} min •{' '}
                      <span className="text-text-secondary">R$ {service.price.toFixed(2)}</span>
                    </p>
                  </div>
                  {selectedServiceId === service.id && (
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-accent"></div>
                  )}
                </div>
              ))}
            </div>
            {errors.serviceId && (
              <p className="text-danger text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.serviceId.message}
              </p>
            )}
          </div>

          <div className="border-t border-border"></div>

          {/* SEÇÃO 2: PROFISSIONAL */}
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
              <User size={18} className="text-accent" /> Profissional
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => setValue('staffId', 'any', { shouldValidate: true })}
                className={`cursor-pointer p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all text-center
                            ${selectedStaffId === 'any' ? 'bg-accent/15 border-accent' : 'bg-bg border-border hover:border-border-strong'}
                        `}
              >
                <User size={20} className="text-text-secondary" />
                <span className="font-bold text-xs text-text-primary">Qualquer</span>
              </div>
              {staff.map(member => (
                <div
                  key={member.id}
                  onClick={() => setValue('staffId', member.id, { shouldValidate: true })}
                  className={`cursor-pointer p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all text-center
                                ${selectedStaffId === member.id ? 'bg-accent/15 border-accent' : 'bg-bg border-border hover:border-border-strong'}
                            `}
                >
                  <Avatar src={member.avatarUrl} name={member.name} size="xs" />
                  <span className="font-bold text-xs text-text-primary">{member.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border"></div>

          {/* SEÇÃO 3: DATA E HORA */}
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-accent" /> Data e Horário
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-text-secondary font-bold uppercase tracking-wider">
                  Data
                </label>
                {dateLabel && (
                  <p className="text-sm text-text-primary font-medium capitalize">{dateLabel}</p>
                )}
                <div className="rounded-xl border border-border bg-bg px-2 py-2">
                  <ThemedCalendar
                    value={date}
                    min={today}
                    max={maxDate}
                    isDayDisabled={day => isShopDayClosed(day, settings)}
                    onChange={iso => {
                      setValue('date', iso, { shouldValidate: true });
                      setValue('time', '', { shouldValidate: false });
                    }}
                  />
                </div>
                <input type="hidden" {...register('date')} />
                {errors.date && (
                  <p className="text-danger text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.date.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs text-text-secondary font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Clock size={12} className="text-accent" /> Horários disponíveis
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.length === 0 ? (
                    <div
                      className={`col-span-4 text-center py-4 bg-bg rounded-xl text-xs border border-dashed transition-colors
                                    ${isDateClosed ? 'border-danger/50 text-danger bg-danger/5' : 'border-border text-text-muted'}
                                `}
                    >
                      {isDateClosed ? (
                        <span className="flex items-center justify-center gap-2">
                          <AlertCircle size={14} /> Fechado neste dia. Escolha outra data.
                        </span>
                      ) : date ? (
                        'Nenhum horário livre neste dia.'
                      ) : (
                        'Selecione uma data para ver os horários'
                      )}
                    </div>
                  ) : (
                    timeSlots.map(slot => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setValue('time', slot, { shouldValidate: true })}
                        className={`py-2 rounded-lg text-xs font-bold transition-all border ${
                          time === slot
                            ? 'bg-accent text-accent-fg border-accent'
                            : 'bg-bg text-text-secondary border-border hover:border-border-strong hover:bg-surface'
                        }`}
                      >
                        {slot}
                      </button>
                    ))
                  )}
                </div>
                {errors.time && (
                  <p className="text-danger text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.time.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-border"></div>

          {publicProducts.length > 0 && (
            <>
              <div className="space-y-4 animate-fade-in">
                <div>
                  <h3 className="text-lg font-bold text-text-primary mb-1 flex items-center gap-2">
                    <DynamicIcon name="ShoppingBag" size={18} className="text-accent" />
                    Produtos para reservar
                  </h3>
                  <p className="text-xs text-text-muted">
                    Opcional. O salão separa para você e confirma o pagamento no atendimento.
                  </p>
                </div>

                <div className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-2">
                  {publicProducts.map(product => {
                    const quantity = reservedProducts[product.id] ?? 0;
                    const disabledAdd =
                      product.trackStock && quantity >= Math.floor(product.stockQty);

                    return (
                      <article
                        key={product.id}
                        className={`snap-start min-w-[180px] max-w-[180px] rounded-xl border bg-bg p-3 transition-all ${
                          quantity > 0
                            ? 'border-accent/60 shadow-sm shadow-accent/10'
                            : 'border-border hover:border-border-strong'
                        }`}
                      >
                        <div className="aspect-square overflow-hidden rounded-lg bg-surface border border-border mb-3">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-text-muted">
                              <DynamicIcon name="Package" size={32} />
                            </div>
                          )}
                        </div>
                        <p className="line-clamp-2 min-h-[2.5rem] text-sm font-bold text-text-primary">
                          {product.name}
                        </p>
                        <p className="mt-1 text-sm font-black text-accent">
                          {formatCurrency(product.salePrice)}
                        </p>
                        {product.description && (
                          <p className="mt-1 line-clamp-2 text-[11px] text-text-muted">
                            {product.description}
                          </p>
                        )}

                        <div className="mt-3 flex items-center justify-between rounded-lg border border-border bg-surface p-1">
                          <button
                            type="button"
                            onClick={() => changeProductQuantity(product, -1)}
                            disabled={quantity === 0}
                            className="h-8 w-8 rounded-md text-text-secondary transition hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label={`Remover ${product.name}`}
                          >
                            -
                          </button>
                          <span className="text-sm font-bold text-text-primary">{quantity}</span>
                          <button
                            type="button"
                            onClick={() => changeProductQuantity(product, 1)}
                            disabled={disabledAdd}
                            className="h-8 w-8 rounded-md bg-surface-2 text-text-primary transition hover:bg-border-strong disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label={`Adicionar ${product.name}`}
                          >
                            +
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>

                {selectedProducts.length > 0 && (
                  <div className="rounded-xl border border-accent/25 bg-selection px-4 py-3 text-sm">
                    <p className="font-bold text-text-primary">
                      {selectedProducts.length} produto(s) reservado(s)
                    </p>
                    <p className="text-xs text-text-secondary">
                      Total estimado: {formatCurrency(reservedProductsTotal)}. Pagamento no salão.
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t border-border"></div>
            </>
          )}

          {/* SEÇÃO 4: DADOS PESSOAIS */}
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
              <User size={18} className="text-accent" /> Seus Dados
            </h3>
            <div className="space-y-3">
              <div>
                <div className="relative">
                  <input
                    type="text"
                    className={`w-full bg-bg border rounded-xl px-4 py-3 text-text-primary focus:ring-2 focus:ring-accent outline-none transition-all ${errors.customerName ? 'border-danger' : 'border-border'}`}
                    placeholder="Seu nome completo"
                    {...register('customerName')}
                  />
                  <User
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted"
                    size={18}
                  />
                </div>
                {errors.customerName && (
                  <p className="text-danger text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.customerName.message}
                  </p>
                )}
              </div>
              <div>
                <div className="relative">
                  <input
                    type="tel"
                    className={`w-full bg-bg border rounded-xl px-4 py-3 text-text-primary focus:ring-2 focus:ring-accent outline-none transition-all ${errors.whatsapp ? 'border-danger' : 'border-border'}`}
                    placeholder="WhatsApp (11) 99999-9999"
                    value={watch('whatsapp') ?? ''}
                    onChange={e =>
                      setValue('whatsapp', maskPhone(e.target.value), { shouldValidate: true })
                    }
                  />
                  <Smartphone
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted"
                    size={18}
                  />
                </div>
                {errors.whatsapp && (
                  <p className="text-danger text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.whatsapp.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-xl font-bold text-text-primary bg-accent hover:bg-accent-hover shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 mt-8"
          >
            <CheckCircle size={20} /> Confirmar Agendamento
          </button>
        </form>
      </div>
    </div>
  );
};
