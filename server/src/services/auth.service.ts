import { UserRepository } from '../repositories/user.repository';
import { hashPassword, comparePassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { ConflictError, UnauthorizedError, NotFoundError } from '../utils/errors';
import { RegisterInput, LoginInput } from '../validators/auth.validator';

export class AuthService {
  private userRepo: UserRepository;

  constructor() {
    this.userRepo = new UserRepository();
  }

  async register(input: RegisterInput) {
    const existing = await this.userRepo.findByEmail(input.email);
    if (existing) {
      throw new ConflictError('A user with this email already exists');
    }

    const passwordHash = await hashPassword(input.password);
    const user = await this.userRepo.create({
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role as any,
      organization: input.organization || 'AssessPulse Org',
    });

    const tokenPayload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Store refresh token
    const refreshExpiresAt = new Date();
    refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 7);
    await this.userRepo.createRefreshToken(user.id, refreshToken, refreshExpiresAt);

    // Return sanitized user
    const sanitizedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organization: user.organization,
      avatar: user.avatar,
      createdAt: user.createdAt,
    };

    return {
      user: sanitizedUser,
      token: accessToken,
      accessToken,
      refreshToken,
    };
  }

  async login(input: LoginInput) {
    const user = await this.userRepo.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isValidPassword = await comparePassword(input.password, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const tokenPayload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    const refreshExpiresAt = new Date();
    refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 7);
    await this.userRepo.createRefreshToken(user.id, refreshToken, refreshExpiresAt);

    const sanitizedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organization: user.organization,
      avatar: user.avatar,
      createdAt: user.createdAt,
    };

    return {
      user: sanitizedUser,
      token: accessToken,
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(rawRefreshToken: string) {
    let decoded: any;
    try {
      decoded = verifyRefreshToken(rawRefreshToken);
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const storedToken = await this.userRepo.findRefreshToken(rawRefreshToken);
    if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedError('Refresh token revoked or expired');
    }

    const user = storedToken.user;
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // Revoke old token and issue new pair (rotation)
    await this.userRepo.revokeRefreshToken(rawRefreshToken);

    const tokenPayload = { userId: user.id, email: user.email, role: user.role };
    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    const refreshExpiresAt = new Date();
    refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 7);
    await this.userRepo.createRefreshToken(user.id, newRefreshToken, refreshExpiresAt);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      token: newAccessToken,
    };
  }

  async logout(refreshToken?: string, userId?: string) {
    if (refreshToken) {
      await this.userRepo.revokeRefreshToken(refreshToken);
    } else if (userId) {
      await this.userRepo.revokeAllUserRefreshTokens(userId);
    }
  }

  async getCurrentUser(userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organization: user.organization,
      avatar: user.avatar,
      createdAt: user.createdAt,
    };
  }
}
