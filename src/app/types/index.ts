export type ExtractedData = {
  fileName: string;
  firstName: string;
  lastName: string;
  email: string;
  template?: EmailTemplate;
};

export enum EmailTemplate {
  ACKNOWLEDGMENT = 'acknowledgment',
  SCREENING = 'screening'
}

export default ExtractedData;

export const SUPPORTED_FILE_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'] as const;
