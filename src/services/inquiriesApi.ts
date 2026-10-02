import type { ContactInquiry } from '../types/player';

export interface InquiryInput { name: string; email: string; organization: string; message: string; }

const readResponse = async <T,>(response: Response): Promise<T> => {
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { error?: string };
    throw new Error(body.error || `Inquiry request failed (${response.status})`);
  }
  return response.status === 204 ? undefined as T : await response.json() as T;
};

export const createInquiry = async (input: InquiryInput): Promise<{ id: string; status: string }> => readResponse(await fetch('/api/inquiries', {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input),
}));

export const getInquiries = async (): Promise<ContactInquiry[]> => readResponse(await fetch('/api/inquiries', { credentials: 'include' }));
export const markInquiryRead = async (id: string): Promise<void> => readResponse(await fetch(`/api/inquiries/${id}/read`, { method: 'PATCH', credentials: 'include' }));
export const deleteInquiry = async (id: string): Promise<void> => readResponse(await fetch(`/api/inquiries/${id}`, { method: 'DELETE', credentials: 'include' }));
