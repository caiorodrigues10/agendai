import type { Meta, StoryObj } from '@storybook/react-vite';
import { Skeleton, SkeletonRegion } from './Skeleton';
import { CardSkeleton } from './CardSkeleton';
import { TableSkeleton } from './TableSkeleton';
import { ListSkeleton } from './ListSkeleton';
import { FormSkeleton } from './FormSkeleton';

const meta = {
  title: 'Padrões/Skeleton',
  component: Skeleton,
  tags: ['autodocs', 'test'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Skeleton>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Base: Story = {
  args: { width: '16rem', height: '1rem' },
};

export const Variants: Story = {
  render: () => (
    <div className="w-80 space-y-3 p-4">
      <Skeleton width="100%" height="1rem" />
      <Skeleton variant="rounded" width="70%" height="2.5rem" />
      <Skeleton variant="circle" width="3rem" height="3rem" />
    </div>
  ),
};

export const Region: Story = {
  render: () => (
    <div className="w-80 p-4">
      <SkeletonRegion loading>
        <div className="space-y-2">
          <Skeleton width="100%" height="1rem" />
          <Skeleton width="80%" height="1rem" />
        </div>
      </SkeletonRegion>
    </div>
  ),
};

export const CardVariants: Story = {
  render: () => (
    <div className="grid w-96 grid-cols-2 gap-3 p-4">
      <CardSkeleton />
      <CardSkeleton variant="stat" />
      <CardSkeleton variant="compact" />
      <CardSkeleton variant="avatar" />
    </div>
  ),
};

export const Table: Story = {
  render: () => (
    <div className="w-96 p-4">
      <TableSkeleton rows={3} hasAvatar hasActions />
    </div>
  ),
};

export const List: Story = {
  render: () => (
    <div className="w-80 p-4">
      <ListSkeleton />
    </div>
  ),
};

export const Form: Story = {
  render: () => (
    <div className="w-80 p-4">
      <FormSkeleton />
    </div>
  ),
};
