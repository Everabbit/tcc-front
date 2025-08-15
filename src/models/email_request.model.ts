export interface EmailRequestI {
  id?: number;
  email: string;
  hash: string;
  sentDate: Date;
  accepted: boolean;
}
