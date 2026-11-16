/// <reference types="vitest/globals" />
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { TrafficOverviewFilters } from './TrafficOverviewFilters';
import type { TrafficArea, TrafficPeriod } from '../../infra/adminTrafficApi';

interface HarnessProps {
  period?: TrafficPeriod;
  area?: TrafficArea;
  onPeriodChange?: (period: TrafficPeriod) => void;
  onAreaChange?: (area: TrafficArea) => void;
}

function renderFilters({
  period = 'week',
  area = 'all',
  onPeriodChange = vi.fn(),
  onAreaChange = vi.fn(),
}: HarnessProps = {}) {
  return render(
    <TrafficOverviewFilters
      period={period}
      area={area}
      selectedRole={undefined}
      date={undefined}
      month={undefined}
      today="2026-11-15"
      currentMonth="2026-11"
      onPeriodChange={onPeriodChange}
      onAreaChange={onAreaChange}
      onRoleChange={vi.fn()}
      onDateChange={vi.fn()}
      onMonthChange={vi.fn()}
    />
  );
}

describe('TrafficOverviewFilters (semântica de filtro)', () => {
  it('expõe período e área como grupos de botões com aria-pressed', () => {
    renderFilters();

    const periodGroup = screen.getByRole('group', { name: 'Período' });
    const areaGroup = screen.getByRole('group', { name: 'Área' });

    // Opção ativa = pressed; demais = não pressed.
    expect(screen.getByRole('button', { name: 'Semana' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Dia' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'Todas' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Site público' })).toHaveAttribute(
      'aria-pressed',
      'false'
    );

    expect(periodGroup).toBeInTheDocument();
    expect(areaGroup).toBeInTheDocument();
  });

  it('não anuncia tablist nem aponta aria-controls para painéis inexistentes', () => {
    const { container } = renderFilters();

    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
    expect(container.querySelector('[aria-controls]')).toBeNull();
    expect(container.querySelector('[aria-selected]')).toBeNull();
  });

  it('dispara o callback do grupo ao escolher outra opção', () => {
    const onPeriodChange = vi.fn();
    const onAreaChange = vi.fn();
    renderFilters({ onPeriodChange, onAreaChange });

    fireEvent.click(screen.getByRole('button', { name: '3 meses' }));
    expect(onPeriodChange).toHaveBeenCalledWith('3m');

    fireEvent.click(screen.getByRole('button', { name: 'Área logada' }));
    expect(onAreaChange).toHaveBeenCalledWith('logged_area');
  });
});
