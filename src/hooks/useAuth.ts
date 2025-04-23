
// Types, re-exports and simple pass-through wrapper
export type { UserProfile, UserRole } from './useAuth.types'; // move types to a .types file

export { useLogin } from './useLogin';
export { useRegister } from './useRegister';
export { useProviderAuth } from './useProviderAuth';
export { useLogout } from './useLogout';
export { useCurrentUser } from './useCurrentUser';
export { useUpdatePassword } from './useUpdatePassword';

// Export useAuth from context for direct access
export { useAuth } from '@/contexts/AuthContext';
