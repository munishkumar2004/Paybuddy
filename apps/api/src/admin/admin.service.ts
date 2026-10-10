import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // ─── Stats ───
  async stats() {
    const [userCount, txnCount, successTxns, blockedUsers] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.transaction.count(),
      this.prisma.transaction.aggregate({
        where: { status: "SUCCESS" },
        _sum: { amount: true },
      }),
      this.prisma.user.count({ where: { isBlocked: true } }),
    ]);

    return {
      totalUsers: userCount,
      totalTransactions: txnCount,
      totalVolumePaise: successTxns._sum.amount || 0,
      blockedUsers,
    };
  }

  // ─── Users ───
  async listUsers(search?: string) {
    return this.prisma.user.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { phone: { contains: search } },
            ],
          }
        : undefined,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        phone: true,
        balance: true,
        isAdmin: true,
        isBlocked: true,
        createdAt: true,
        _count: { select: { sentTxs: true, receivedTxs: true } },
      },
      take: 100,
    });
  }

  async blockUser(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { isBlocked: true },
    });
  }

  async unblockUser(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { isBlocked: false },
    });
  }

  async topup(id: string, amountInRupees: number) {
    if (amountInRupees <= 0) throw new BadRequestException("Amount must be > 0");
    if (amountInRupees > 50000)
      throw new BadRequestException("Max ₹50,000 per topup");

    const paise = Math.round(amountInRupees * 100);

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id },
        data: { balance: { increment: paise } },
      });

      await tx.transaction.create({
        data: {
          receiverId: user.id,
          amount: paise,
          type: "TOPUP",
          status: "SUCCESS",
          note: "Admin top-up",
        },
      });

      await tx.activityLog.create({
        data: {
          userId: user.id,
          action: "ADMIN_TOPUP",
          meta: { amountPaise: paise },
        },
      });

      return user;
    });
  }

  // ─── Transactions ───
  async listTransactions(opts: {
    status?: string;
    search?: string;
    limit?: number;
  }) {
    const where: any = {};
    if (opts.status) where.status = opts.status;
    if (opts.search) {
      where.OR = [
        { refId: { contains: opts.search } },
        { note: { contains: opts.search, mode: "insensitive" } },
        {
          sender: {
            OR: [
              { phone: { contains: opts.search } },
              { name: { contains: opts.search, mode: "insensitive" } },
            ],
          },
        },
        {
          receiver: {
            OR: [
              { phone: { contains: opts.search } },
              { name: { contains: opts.search, mode: "insensitive" } },
            ],
          },
        },
      ];
    }

    return this.prisma.transaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        sender: { select: { name: true, phone: true } },
        receiver: { select: { name: true, phone: true } },
      },
      take: opts.limit || 100,
    });
  }

  // ─── Activity Logs ───
  async listLogs(opts: { userId?: string; limit?: number }) {
    return this.prisma.activityLog.findMany({
      where: opts.userId ? { userId: opts.userId } : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, phone: true } },
      },
      take: opts.limit || 100,
    });
  }
}