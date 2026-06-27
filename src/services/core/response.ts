export type ApiResponse<T> = {
  data: T | null;
  success: boolean;
  error: string | null;
  message: string;
};

/**
 * Creates a response object
 * @param data - Data to return
 * @param success - Whether the operation was successful
 * @param error - Error message
 * @param message - Message to return
 * @returns {Object} Response object
 */
export function response<T>(
  data: T | null,
  success: boolean,
  error: string | null = null,
  message: string = "",
): ApiResponse<T> {
  return { data, success, error, message };
}
