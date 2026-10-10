import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { WalletService } from "./wallet.service";
import { JwtGuard } from "../auth/jwt.guard";

@Controller("wallet")
@UseGuards(JwtGuard)
export class WalletController {
  constructor(private wallet: WalletService) {}

  @Get("me")
  me(@Req() req: any) {
    return this.wallet.me(req.user.userId);
  }

  @Post("send")
  send(@Req() req: any, @Body() body: any) {
    return this.wallet.sendMoney(req.user.userId, body);
  }

  @Get("history")
  history(@Req() req: any) {
    return this.wallet.history(req.user.userId);
  }
}