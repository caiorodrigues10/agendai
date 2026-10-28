import type { Meta, StoryObj } from '@storybook/react-vite';
import { http, HttpResponse } from 'msw';
import { GalleryManager } from './GalleryManager';
import { BarbershopFiltersContext } from '../../contexts/BarbershopFiltersContext';
import type { PostMedia } from '../../infra/postsApi';

const json = (data: unknown) => HttpResponse.json({ success: true, data });

/** Thumbnail embutido no próprio story: nada de URL externa no snapshot. */
const svg = (bg: string, accent = '#2cb58a') =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="720"><rect width="720" height="720" fill="${bg}"/><circle cx="360" cy="300" r="150" fill="${accent}" opacity="0.55"/><rect x="140" y="500" width="440" height="90" rx="20" fill="#0f1110" opacity="0.6"/></svg>`
  )}`;

const photos: PostMedia[] = [
  { id: 'g-1', url: svg('#14261c'), mimeType: 'image/svg+xml', size: 2048, createdAt: '2026-09-20T12:00:00.000Z', inGallery: true },
  { id: 'g-2', url: svg('#1c2233', '#60a5fa'), mimeType: 'image/svg+xml', size: 2048, createdAt: '2026-09-24T12:00:00.000Z', inGallery: true },
];

const mswHandlers = [
  http.get('/api/posts/media', () => json(photos)),
];

const meta = {
  title: 'Posts/Fotos do perfil (GalleryManager)',
  component: GalleryManager,
  tags: ['autodocs', 'test'],
  parameters: {
    layout: 'padded',
    msw: { handlers: mswHandlers },
  },
  decorators: [
    (Story: () => React.ReactElement) => (
      <BarbershopFiltersContext.Provider
        value={{
          barbershopId: 'shop-1',
          staffId: null,
          dateRange: null,
          setBarbershopId: () => undefined,
          setStaffId: () => undefined,
          setDateRange: () => undefined,
        }}
      >
        <Story />
      </BarbershopFiltersContext.Provider>
    ),
  ],
} satisfies Meta<typeof GalleryManager>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
