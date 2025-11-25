import { UserRole } from '../common/constants/constants';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}