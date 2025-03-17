import Affiliate from '../models/Affiliate';

export const generateReferralCode = async (): Promise<string> => {
  const length = 8;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code: string;

  do {
    code = '';
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  } while (await Affiliate.findOne({ referralCode: code }));

  return code;
}; 