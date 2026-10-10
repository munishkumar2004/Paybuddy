import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { AdminService } from "./admin.service";
import { JwtGuard } from "../auth/jwt.guard";
import { AdminGuard } from "./admin.guard";

@Controller("admin")
@UseGuards(JwtGuard, AdminGuard)
export class AdminController {
  constructor(private admin: AdminService) {}

  @Get("stats")
  stats() {
    return this.admin.stats();
  }

  @Get("users")
  users(@Query("search") search?: string) {
    return this.admin.listUsers(search);
  }

  @Post("users/:id/block")
  block(@Param("id") id: string) {
    return this.admin.blockUser(id);
  }

  @Post("users/:id/unblock")
  unblock(@Param("id") id: string) {
    return this.admin.unblockUser(id);
  }

  @Post("users/:id/topup")
  topup(@Param("id") id: string, @Body() body: { amount: number }) {
    return this.admin.topup(id, body.amount);
  }

  @Get("transactions")
  transactions(
    @Query("status") status?: string,
    @Query("search") search?: string
  ) {
    return this.admin.listTransactions({ status, search });
  }

  @Get("logs")
  logs(@Query("userId") userId?: string) {
    return this.admin.listLogs({ userId });
  }
}