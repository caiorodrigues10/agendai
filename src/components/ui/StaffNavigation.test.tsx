/// <reference types="vitest/globals" />
import { fireEvent, render, screen, within } from '@testing-library/react';
import { StaffNavigation } from './StaffNavigation';

describe('StaffNavigation', () => {
  it('mantém quatro destinos operacionais e Mais na navegação compacta', () => {
    render(<StaffNavigation activeTab="overview" userRole="OWNER" onNavigate={vi.fn()} />);

    const compactNavigation = screen.getByRole('navigation', {
      name: 'Navegação compacta do painel',
    });

    expect(within(compactNavigation).getByRole('button', { name: 'Hoje' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    expect(within(compactNavigation).getByRole('button', { name: 'Fila' })).toBeInTheDocument();
    expect(within(compactNavigation).getByRole('button', { name: 'Agenda' })).toBeInTheDocument();
    expect(within(compactNavigation).getByRole('button', { name: 'Clientes' })).toBeInTheDocument();
    expect(within(compactNavigation).getByRole('button', { name: 'Mais' })).toBeInTheDocument();
  });

  it('lista somente módulos permitidos na folha Mais e navega ao selecionar um item', () => {
    const onNavigate = vi.fn();

    render(<StaffNavigation activeTab="overview" userRole="EMPLOYEE" onNavigate={onNavigate} />);

    fireEvent.click(screen.getByRole('button', { name: 'Mais' }));

    const dialog = screen.getByRole('dialog', { name: 'Mais opções' });
    expect(within(dialog).getByRole('button', { name: 'Configurações' })).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Perfil' })).toBeInTheDocument();
    expect(within(dialog).queryByRole('button', { name: 'Serviços' })).not.toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Perfil' }));

    expect(onNavigate).toHaveBeenCalledWith('profile');
    expect(screen.queryByRole('dialog', { name: 'Mais opções' })).not.toBeInTheDocument();
  });

  it('fecha a folha Mais ao pressionar Escape e marca Mais quando uma opção secundária está ativa', () => {
    render(<StaffNavigation activeTab="finance" userRole="OWNER" onNavigate={vi.fn()} />);

    const moreButton = screen.getByRole('button', { name: 'Mais' });
    expect(moreButton).toHaveAttribute('aria-current', 'page');

    fireEvent.click(moreButton);
    expect(screen.getByRole('dialog', { name: 'Mais opções' })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog', { name: 'Mais opções' })).not.toBeInTheDocument();
  });

  it('aplica font-display (Syne) nos títulos, rótulos e itens de navegação', () => {
    render(<StaffNavigation activeTab="overview" userRole="OWNER" onNavigate={vi.fn()} />);

    const desktopNav = screen.getByRole('navigation', { name: 'Navegação do painel' });
    expect(within(desktopNav).getByText('Áreas do salão')).toHaveClass('font-display');
    expect(within(desktopNav).getByText('Hoje')).toHaveClass('font-display');

    const compactNav = screen.getByRole('navigation', { name: 'Navegação compacta do painel' });
    expect(within(compactNav).getByText('Mais')).toHaveClass('font-display');

    fireEvent.click(within(compactNav).getByText('Mais'));
    const dialog = screen.getByRole('dialog', { name: 'Mais opções' });
    expect(within(dialog).getByText('Mais opções')).toHaveClass('font-display');
  });

  it('mostra Produtos na folha Mais só com dashboard Pro', () => {
    const hidden = render(
      <StaffNavigation activeTab="overview" userRole="OWNER" onNavigate={vi.fn()} />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Mais' }));
    expect(screen.queryByRole('button', { name: 'Produtos' })).not.toBeInTheDocument();
    hidden.unmount();

    render(
      <StaffNavigation
        activeTab="overview"
        userRole="OWNER"
        hasDashboard
        onNavigate={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Mais' }));
    expect(within(screen.getByRole('dialog', { name: 'Mais opções' })).getByRole('button', { name: 'Produtos' })).toBeInTheDocument();
  });

  it('oculta Agenda no modo exclusivo de fila e Fila no modo exclusivo de agenda', () => {
    const { rerender } = render(
      <StaffNavigation activeTab="overview" userRole="OWNER" operationMode="QUEUE_ONLY" onNavigate={vi.fn()} />
    );
    const compactNavigation = screen.getByRole('navigation', { name: 'Navegação compacta do painel' });
    expect(within(compactNavigation).queryByRole('button', { name: 'Agenda' })).not.toBeInTheDocument();
    expect(within(compactNavigation).getByRole('button', { name: 'Fila' })).toBeInTheDocument();

    rerender(
      <StaffNavigation activeTab="overview" userRole="OWNER" operationMode="APPOINTMENTS_ONLY" onNavigate={vi.fn()} />
    );
    expect(within(compactNavigation).queryByRole('button', { name: 'Fila' })).not.toBeInTheDocument();
    expect(within(compactNavigation).getByRole('button', { name: 'Agenda' })).toBeInTheDocument();
  });
});
