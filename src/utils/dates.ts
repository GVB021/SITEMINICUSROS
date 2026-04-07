/** Returns the number of nights between two ISO date strings (minimum 1). */
export function computeNights(checkIn: string, checkOut: string): number {
  return Math.max(
    1,
    Math.ceil(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000
    )
  );
}
