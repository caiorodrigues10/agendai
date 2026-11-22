/// <reference types="vitest/globals" />
import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { SettingsNav } from './SettingsNav';
import {
  SETTINGS_SECTIONS,
  SETTINGS_SECTION_GROUPS,
  type SettingsSection,
} from './settingsSections';

const SIDEBAR_MEDIA = '(min-width: 1280px)';
const REDUCED_MOTION_MEDIA = '(prefers-reduced-motion: reduce)';
const scrollIntoView = vi.fn();

/** jsdom não implementa `scrollIntoView`; o spy também deixa o teste assertivo. */
function stubScrollIntoView() {
  Object.defineProperty(Element.prototype, 'scrollIntoView', {
    configurable: true,
    writable: true,
    value: scrollIntoView,
  });
}

/**
 * O `matchMedia` global do setup responde `false` para toda query, ou seja,
 * o teste roda no modo faixa rolável. Aqui dá para simular a viewport desktop.
 */
let restoreViewport: (() => void) | null = null;

function mockViewport({ sidebar = false, reducedMotion = false } = {}) {
  const original = window.matchMedia;
  window.matchMedia = vi.fn((query: string) => ({
    matches:
      query === SIDEBAR_MEDIA ? sidebar : query === REDUCED_MOTION_MEDIA ? reducedMotion : false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as typeof window.matchMedia;
  restoreViewport = () => {
    window.matchMedia = original;
  };
}

function Harness({ initial = 'account' }: { initial?: SettingsSection }) {
  const [value, setValue] = useState<SettingsSection>(initial);
  return (
    <SettingsNav value={value} onChange={setValue} ariaLabel="Seções de configurações">
      <p>Painel de {value}</p>
    </SettingsNav>
  );
}

const tab = (label: string) => screen.getByRole('tab', { name: label });

beforeEach(() => {
  stubScrollIntoView();
  scrollIntoView.mockClear();
});

afterEach(() => {
  restoreViewport?.();
  restoreViewport = null;
});

describe('SettingsNav', () => {
  it('renderiza as 10 seções com rótulo e ícone', () => {
    render(<Harness />);
    expect(screen.getAllByRole('tab')).toHaveLength(SETTINGS_SECTIONS.length);
    for (const section of SETTINGS_SECTIONS) {
      expect(tab(section.label).querySelector('svg'), section.label).not.toBeNull();
    }
  });

  it('agrupa as seções por assunto mantendo os mesmos ids', () => {
    render(<Harness />);
    expect(screen.getByRole('tablist', { name: 'Seções de configurações' })).toBeInTheDocument();
    for (const group of SETTINGS_SECTION_GROUPS) {
      const container = screen.getByRole('group', { name: group.label });
      const expected = SETTINGS_SECTIONS.filter(section => section.group === group.id);
      expect(container.querySelectorAll('[role="tab"]')).toHaveLength(expected.length);
    }
    expect(screen.getAllByRole('group')).toHaveLength(SETTINGS_SECTION_GROUPS.length);
  });

  it('mantém a navegação móvel em uma única faixa rolável', () => {
    render(<Harness />);
    const tablist = screen.getByRole('tablist', { name: 'Seções de configurações' });
    expect(tablist).toHaveClass('overflow-x-auto');
    expect(tablist).not.toHaveClass('flex-wrap');
    expect(tablist).toHaveAttribute('aria-orientation', 'horizontal');
  });

  it('destaca a seção ativa com fundo, borda e indicador de acento', () => {
    render(<Harness />);
    const active = tab('Conta');
    expect(active).toHaveClass('border-accent/30', 'bg-selection', 'text-accent');
    expect(active.querySelector('.bg-accent')).toBeInTheDocument();
  });

  it('clicar troca a seção e move o aria-selected', () => {
    render(<Harness />);
    expect(tab('Conta')).toHaveAttribute('aria-selected', 'true');
    fireEvent.click(tab('Importar dados'));
    expect(tab('Importar dados')).toHaveAttribute('aria-selected', 'true');
    expect(tab('Conta')).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Painel de import');
  });

  it('associa cada aba ao seu painel e usa roving tabindex', () => {
    render(<Harness />);
    const active = tab('Conta');
    const visiblePanel = screen.getByRole('tabpanel');

    for (const section of SETTINGS_SECTIONS) {
      const sectionTab = tab(section.label);
      const panel = document.getElementById(sectionTab.getAttribute('aria-controls')!)!;
      expect(panel, section.label).toHaveAttribute('role', 'tabpanel');
      expect(panel, section.label).toHaveAttribute('aria-labelledby', sectionTab.id);
    }

    expect(screen.getAllByRole('tabpanel', { hidden: true })).toHaveLength(
      SETTINGS_SECTIONS.length
    );
    expect(active).toHaveAttribute('aria-controls', visiblePanel.id);
    expect(visiblePanel).toHaveAttribute('aria-labelledby', active.id);
    expect(visiblePanel).toHaveAttribute('tabindex', '0');
    expect(active).toHaveAttribute('tabindex', '0');
    expect(tab('WhatsApp')).toHaveAttribute('tabindex', '-1');
  });

  it('navega por teclado com setas, Home e End', () => {
    render(<Harness />);

    fireEvent.keyDown(tab('Conta'), { key: 'ArrowDown' });
    expect(tab('Estabelecimento')).toHaveAttribute('aria-selected', 'true');
    expect(tab('Estabelecimento')).toHaveFocus();

    fireEvent.keyDown(tab('Estabelecimento'), { key: 'ArrowRight' });
    expect(tab('Funcionamento')).toHaveAttribute('aria-selected', 'true');

    fireEvent.keyDown(tab('Funcionamento'), { key: 'ArrowUp' });
    expect(tab('Estabelecimento')).toHaveAttribute('aria-selected', 'true');

    fireEvent.keyDown(tab('Estabelecimento'), { key: 'ArrowLeft' });
    expect(tab('Conta')).toHaveAttribute('aria-selected', 'true');

    fireEvent.keyDown(tab('Conta'), { key: 'End' });
    expect(tab('Ajuda e suporte')).toHaveAttribute('aria-selected', 'true');

    fireEvent.keyDown(tab('Ajuda e suporte'), { key: 'Home' });
    expect(tab('Conta')).toHaveAttribute('aria-selected', 'true');
  });

  it('rola a aba ativa para a vista na faixa rolável', () => {
    render(<Harness initial="import" />);
    expect(scrollIntoView).toHaveBeenCalledWith(
      expect.objectContaining({ block: 'nearest', inline: 'center' })
    );
  });

  it('centraliza a nova aba ativa na faixa rolável', () => {
    render(<Harness />);
    const target = tab('Importar dados');
    const targetScroll = vi.spyOn(target, 'scrollIntoView');
    fireEvent.click(target);
    expect(targetScroll).toHaveBeenCalledWith(
      expect.objectContaining({ block: 'nearest', inline: 'center' })
    );
  });

  it('ao trocar de seção no mobile, rola o conteúdo para o topo', () => {
    render(<Harness />);
    const panel = screen.getByRole('tabpanel');
    const panelScroll = vi.spyOn(panel, 'scrollIntoView');
    fireEvent.click(tab('Privacidade'));
    expect(panelScroll).toHaveBeenCalledWith(
      expect.objectContaining({ block: 'start', inline: 'nearest' })
    );
  });

  it('usa rolagem imediata quando o usuário prefere menos movimento', () => {
    mockViewport({ reducedMotion: true });
    render(<Harness />);
    fireEvent.click(tab('Importar dados'));
    expect(scrollIntoView).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'auto' }));
  });

  it('no desktop usa coluna vertical e rola apenas a aba visível', () => {
    mockViewport({ sidebar: true });
    render(<Harness />);
    const tablist = screen.getByRole('tablist');
    const target = tab('Privacidade');
    const targetScroll = vi.spyOn(target, 'scrollIntoView');
    fireEvent.click(target);

    expect(tablist).toHaveAttribute('aria-orientation', 'vertical');
    expect(tablist.parentElement?.parentElement).toHaveClass(
      'xl:max-h-[calc(100dvh-6rem)]',
      'xl:overflow-y-auto'
    );
    expect(targetScroll).toHaveBeenCalledWith(
      expect.objectContaining({ block: 'nearest', inline: 'nearest' })
    );
    expect(scrollIntoView).not.toHaveBeenCalledWith(expect.objectContaining({ block: 'start' }));
    expect(tab('Privacidade')).toHaveAttribute('aria-selected', 'true');
  });
});
