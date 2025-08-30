import { User } from './user';
import { Pagination } from './pagination';

export interface ServerResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: Pagination;
  token?: string;
  user?: User;
}