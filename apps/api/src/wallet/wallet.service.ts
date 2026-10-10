import { BadRequestException, Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { sendMoneySchema } from "@paybuddy/shared";

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}

  async me(userId: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        phone: true,
        balance: true,
        isAdmin: true,
      },
    });
  }

  async sendMoney(senderId: string, input: any) {
    const data = sendMoneySchema.parse(input);

    return this.prisma.$transaction(async (tx) => {
      const sender = await tx.user.findUniqueOrThrow({
        where: { id: senderId },
      });

      const ok = await bcrypt.compare(data.pin, sender.pinHash);
      if (!ok) throw new BadRequestException("Invalid PIN");

      const receiver = await tx.user.findUnique({
        where: { phone: data.toPhone },
      });
      if (!receiver) throw new BadRequestException("Receiver not found");
      if (receiver.id === sender.id)
        throw new BadRequestException("Cannot send to self");

      const paise = Math.round(data.amount * 100);

      if (sender.balance < paise)
        throw new BadRequestException("Insufficient balance");

      await tx.user.update({
        where: { id: sender.id },
        data: { balance: { decrement: paise } },
      });

      await tx.user.update({
        where: { id: receiver.id },
        data: { balance: { increment: paise } },
      });

      const txn = await tx.transaction.create({
        data: {
          senderId: sender.id,
          receiverId: receiver.id,
          amount: paise,
          type: "DEBIT",
          status: "SUCCESS",
          note: data.note,
        },
      });

      await tx.activityLog.create({
        data: {
          userId: sender.id,
          action: "SEND_MONEY",
          meta: { toPhone: data.toPhone, amount: paise, txnId: txn.id },
        },
      });

      return txn;
    });
  }

  async history(userId: string) {
    return this.prisma.transaction.findMany({
      where: { OR: [{ senderId: userId }, { receiverId: userId }] },
      orderBy: { createdAt: "desc" },
      include: {
        sender: { select: { name: true, phone: true } },
        receiver: { select: { name: true, phone: true } },
      },
      take: 50,
    });
  }
}