import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    user_metadata?: {
      full_name?: string;
    };
  };
}
