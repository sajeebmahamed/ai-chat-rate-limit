export const TYPES = {
  UserRepository: Symbol.for('UserRepository'),
  AuthService: Symbol.for('AuthService'),
  AuthController: Symbol.for('AuthController'),
  AuthUtil: Symbol.for('AuthUtil'),
  AuthMiddleware: Symbol.for('AuthMiddleware'),
  PermissiveAuthMiddleware: Symbol.for('PermissiveAuthMiddleware'),
  ChatService: Symbol.for('ChatService'),
  ChatController: Symbol.for('ChatController'),
  AIService: Symbol.for('AIService'),
  RateLimitMiddleware: Symbol.for('RateLimitMiddleware'),
  RateLimiterService: Symbol.for('RateLimiterService'),
  CleanupService: Symbol.for('CleanupService'),
};
