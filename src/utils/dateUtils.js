export const getDateRange = (filterType, customStart, customEnd) => {
  let startDate = new Date();
  let endDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  switch (filterType) {
    case 'Today': 
      break;
    case 'Yesterday':
      startDate.setDate(startDate.getDate() - 1);
      endDate.setDate(endDate.getDate() - 1);
      break;
    case 'Last 7 Days':
      startDate.setDate(startDate.getDate() - 6);
      break;
    case 'Last 30 Days':
      startDate.setDate(startDate.getDate() - 29);
      break;
    case 'Last 90 Days':
      startDate.setDate(startDate.getDate() - 89);
      break;
    case 'Last 12 Months':
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    case 'This Month':
      startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      break;
    case 'Previous Month':
      startDate = new Date(startDate.getFullYear(), startDate.getMonth() - 1, 1);
      endDate = new Date(startDate.getFullYear(), startDate.getMonth(), 0, 23, 59, 59, 999);
      break;
    case 'This Year':
      startDate = new Date(startDate.getFullYear(), 0, 1);
      break;
    case 'Custom Date Range':
      if (customStart) startDate = new Date(customStart);
      if (customEnd) endDate = new Date(customEnd);
      
      // Ensure custom boundaries are strictly clamped
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      
      // Swap if end is before start
      if (endDate < startDate) {
        const temp = startDate;
        startDate = endDate;
        endDate = temp;
      }
      break;
    default:
      startDate.setDate(startDate.getDate() - 29);
      break;
  }

  return { startDate, endDate };
};
