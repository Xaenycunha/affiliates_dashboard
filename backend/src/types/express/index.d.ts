import { Affiliate } from '../../models/Affiliate';

declare global {
  namespace Express {
    interface Request {
      user?: Affiliate;
    }
  }
} 