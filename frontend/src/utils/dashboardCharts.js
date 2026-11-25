export function getMaxMonthlyValue(monthlyTrend = []) {
  return Math.max(1, ...monthlyTrend.flatMap((item) => [Number(item.income) || 0, Number(item.expense) || 0]));
}

export function getBreakdownTotal(items = []) {
  return items.reduce((total, item) => total + (Number(item.amount) || 0), 0);
}
