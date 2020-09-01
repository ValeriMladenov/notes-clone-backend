import { PrismaClient } from "@prisma/client";
import { Request } from "apollo-server";

const prisma = new PrismaClient();

export interface Context {
  request: Request & any;
  prisma: PrismaClient;
  appSecret: string;
}

export function createContext(request: Request): Context {
  return {
    request,
    prisma,
    appSecret: process.env.JWT_SECRET,
  };
}
