import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { StaffNavigation } from './StaffNavigation';

describe('StaffNavigation', () => {
  it('mantém quatro destinos operacionais e Mais na navegação compacta', () => {
    render(<StaffNavigation activeTab="overview" userRole="OWNER" onNavigate={vi.fn()} />);

    const compactNavigation = screen.getByRole('navigation', {
      name: 'Navegação compacta do painel',
    });

    expect(within(compactNavigation).getByRole('button', { name: 'Visão Geral' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    expect(within(compactNavigation).getByRole('button', { name: 'Fila' })).toBeInTheDocument();
    expect(within(compactNavigation).getByRole('button', { name: 'Agenda' })).toBeInTheDocument();
    expect(within(compactNavigation).getByRole('button', { name: 'Clientes' })).toBeInTheDocument();
    expect(within(compactNavigation).getByRole('button', { name: 'Mais' })).toBeInTheDocument();
  });

  it('lista somente módulos permitidos na folha Mais e navega ao selecionar um item', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();

    render(<StaffNavigation activeTab="overview" userRole="EMPLOYEE" onNavigate={onNavigate} />);

    await user.click(screen.getByRole('button', { name: 'Mais' }));

    const dialog = screen.getByRole('dialog', { name: 'Mais opções' });
    expect(within(dialog).getByRole('button', { name: 'Configurações' })).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Perfil' })).toBeInTheDocument();
    expect(within(dialog).queryByRole('button', { name: 'Serviços' })).not.toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: 'Perfil' }));

    expect(onNavigate).toHaveBeenCalledWith('profile');
    expect(screen.queryByRole('dialog', { name: 'Mais opções' })).not.toBeInTheDocument();
  });

  it('fecha a folha Mais ao pressionar Escape e marca Mais quando uma opção secundária está ativa', async () => {
    const user = userEvent.setup();

    render(<StaffNavigation activeTab="finance" userRole="OWNER" onNavigate={vi.fn()} />);

    const moreButton = screen.getByRole('button', { name: 'Mais' });
    expect(moreButton).toHaveAttribute('aria-current', 'page');

    await user.click(moreButton);
    expect(screen.getByRole('dialog', { name: 'Mais opções' })).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog', { name: 'Mais opções' })).not.toBeInTheDocument();
  });
});
