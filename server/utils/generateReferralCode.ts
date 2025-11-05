export const generateReferralCode = (name: string): string => {
  const cleanName = name.replace(/\s+/g, '').toUpperCase().slice(0, 4);
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${cleanName}${randomNum}`;
};