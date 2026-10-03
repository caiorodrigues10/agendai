import { apiClient } from './apiClient';
import { authStorage } from './authStorage';
import type { FeedPost } from '../types';

export type PublicSocialPost = FeedPost & { shopName: string; shopLogoUrl?: string };
export interface PostComment {
  id: string; content: string; createdAt: string; authorId?: string; authorName: string;
}
export interface TaggedPost {
  id: string; postId: string; barbershopId: string; status: 'PENDING' | 'APPROVED'; post: PublicSocialPost;
}
export interface CommentsPage { data: PostComment[]; meta: { page: number; limit: number; total: number } }

const base = (salonId: string) => `/api/salons/${encodeURIComponent(salonId)}`;
const postPath = (salonId: string, postId: string) => `${base(salonId)}/posts/${encodeURIComponent(postId)}`;
const unwrap = <T,>(response: { data: T }): T => response.data;
const clientToken = () => localStorage.getItem('agendai_client_portal_access') || sessionStorage.getItem('agendai_client_portal_access') || '';
const token = () => authStorage.getAccessToken() || clientToken();
const sessionOptions = () => ({ retried: !authStorage.getAccessToken() && Boolean(clientToken()) });

export const socialApi = {
  canComment: () => Boolean(token()),
  getPost: (salonId: string, postId: string) => apiClient<{ data: PublicSocialPost }>(postPath(salonId, postId)).then(unwrap),
  comments: (salonId: string, postId: string, page = 1) => apiClient<CommentsPage>(`${postPath(salonId, postId)}/comments?page=${page}`),
  comment: (salonId: string, postId: string, content: string) => apiClient<{ data: PostComment }>(`${postPath(salonId, postId)}/comments`, 'POST', { content }, token(), sessionOptions()).then(unwrap),
  deleteComment: async (salonId: string, postId: string, commentId: string) => { await apiClient(`${postPath(salonId, postId)}/comments/${encodeURIComponent(commentId)}`, 'DELETE', undefined, token(), sessionOptions()); },
  stories: (salonId: string) => apiClient<{ data: FeedPost[] }>(`${base(salonId)}/stories`).then(unwrap),
  tagged: (salonId: string, pending = false) => apiClient<{ data: TaggedPost[] }>(`${base(salonId)}/tagged?pending=${pending}`, 'GET', undefined, pending ? authStorage.getAccessToken() || '' : undefined).then(unwrap),
  requestTag: async (salonId: string, postId: string, targetBarbershopId: string) => { await apiClient(`${postPath(salonId, postId)}/tags`, 'POST', { targetBarbershopId }, authStorage.getAccessToken() || ''); },
  moderateTag: async (salonId: string, tagId: string, approve: boolean) => { await apiClient(`${base(salonId)}/tags/${encodeURIComponent(tagId)}`, 'PATCH', { approve }, authStorage.getAccessToken() || ''); },
};
