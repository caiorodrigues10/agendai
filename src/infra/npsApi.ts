import { apiClient } from './apiClient';

export interface NpsSurveyPublic {
  id: string;
  status: 'PENDING' | 'ANSWERED' | 'EXPIRED';
  shopName: string;
  destinationMasked: string;
  expiresAt: string;
}

export interface NpsAnswerResult {
  surveyId: string;
  barbershopId: string;
  score: number;
  comment: string | null;
}

export interface NpsAnswerInput {
  score: number;
  comment?: string;
  lgpdAccepted: boolean;
}

/** Pesquisa NPS pública (link do respondente) — sem autenticação. */
export const npsApi = {
  getSurvey(surveyId: string) {
    return apiClient<{ success: boolean; data: NpsSurveyPublic }>(
      `/api/nps/${surveyId}`,
      'GET',
    );
  },
  answer(surveyId: string, input: NpsAnswerInput) {
    return apiClient<{ success: boolean; data: NpsAnswerResult }>(
      `/api/nps/${surveyId}`,
      'POST',
      input,
    );
  },
};
