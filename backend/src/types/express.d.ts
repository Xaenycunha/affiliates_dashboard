import { Affiliate } from '../models/Affiliate';

declare module 'express' {
  interface Request {
    user?: Affiliate;
  }
} 