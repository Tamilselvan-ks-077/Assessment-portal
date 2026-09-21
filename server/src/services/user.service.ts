import { UserRepository } from '../repositories/user.repository';
import { hashPassword, comparePassword } from '../utils/password';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { UpdateUserInput } from '../validators/user.validator';

export class UserService {
  private userRepo: UserRepository;

  constructor() {
    this.userRepo = new UserRepository();
  }

  async getProfile(userId: string) {
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
      createdAt: user.createdAt.toISOString(),
    };
  }

  async updateProfile(userId: string, input: UpdateUserInput) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    let passwordHash = undefined;
    if (input.newPassword) {
      if (!input.currentPassword) {
        throw new BadRequestError('Current password is required to change password');
      }

      const isMatch = await comparePassword(input.currentPassword, user.passwordHash);
      if (!isMatch) {
        throw new BadRequestError('Current password does not match');
      }

      passwordHash = await hashPassword(input.newPassword);
    }

    const updated = await this.userRepo.update(userId, {
      name: input.name,
      avatar: input.avatar,
      organization: input.organization,
      ...(passwordHash ? { passwordHash } : {}),
    });

    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      organization: updated.organization,
      avatar: updated.avatar,
      createdAt: updated.createdAt.toISOString(),
    };
  }
}
