export const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString();
};

export const calculateScore = (results: any[]) => {
  // Logic to calculate score
  return results.filter(r => r.correct).length;
};
