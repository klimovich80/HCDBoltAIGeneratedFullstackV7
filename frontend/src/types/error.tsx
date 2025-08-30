export interface ExtendedError extends Error {
  response?: {
    data?: {
      message: string;
    };
  };
}