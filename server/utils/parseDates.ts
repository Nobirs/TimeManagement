export const parseDate = (dateString: string | Date): Date => {
  if (dateString instanceof Date) return dateString;
  // Если дата в формате "YYYY-MM-DD"
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return new Date(`${dateString}T00:00:00.000Z`);
  }
  // Если дата уже в ISO формате
  return new Date(dateString);
};
