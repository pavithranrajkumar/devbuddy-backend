import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User, { UserType } from '../models/user.model';
import { RegisterInput, LoginInput } from '../validations/auth/schemas';

class AuthService {
  private static generateToken(userId: number): string {
    return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '24h' });
  }

  public static async register(data: RegisterInput) {
    const existingUser = await User.findOne({ where: { email: data.email } });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await User.create({
      ...data,
      password: hashedPassword,
      userType: data.userType as UserType,
    });

    const token = this.generateToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.userType,
        title: user.title,
        experienceInMonths: user.experienceInMonths,
      },
      token,
    };
  }

  public static async login(data: LoginInput) {
    const user = await User.findOne({ where: { email: data.email } });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(data.password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.userType,
        title: user.title,
        experienceInMonths: user.experienceInMonths,
      },
      token,
    };
  }
}

export default AuthService;
