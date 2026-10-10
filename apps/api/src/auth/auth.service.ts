import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { signupSchema, loginSchema } from "@paybuddy/shared";

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async signup(input: any) {
    const data = signupSchema.parse(input);

    const exists = await this.prisma.user.findUnique({
      where: { phone: data.phone },
    });
    if (exists) throw new BadRequestException("Phone already registered");

    const pinHash = await bcrypt.hash(data.pin, 10);

    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        phone: data.phone,
        pinHash,
        balance: 100000,
      },
    });

    await this.prisma.activityLog.create({
      data: { userId: user.id, action: "SIGNUP" },
    });

    return this.issueToken(user);
  }

  async login(input: any) {
    const data = loginSchema.parse(input);

    const user = await this.prisma.user.findUnique({
      where: { phone: data.phone },
    });
    if (!user) throw new UnauthorizedException("Invalid credentials");
    if (user.isBlocked) throw new UnauthorizedException("Account blocked");

    const ok = await bcrypt.compare(data.pin, user.pinHash);
    if (!ok) throw new UnauthorizedException("Invalid credentials");

    await this.prisma.activityLog.create({
      data: { userId: user.id, action: "LOGIN" },
    });

    return this.issueToken(user);
  }

  private issueToken(user: any) {
    const token = this.jwt.sign({
      sub: user.id,
      phone: user.phone,
      isAdmin: user.isAdmin,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        balance: user.balance,
        isAdmin: user.isAdmin,
      },
    };
  }
}