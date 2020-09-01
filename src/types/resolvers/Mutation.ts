import { getUserId, isAuth } from "../../utils";
import { compare, hash } from "bcryptjs";
import {
  inputObjectType,
  intArg,
  mutationType,
  stringArg,
} from "@nexus/schema";

import { sign } from "jsonwebtoken";

export const UserInputType = inputObjectType({
  name: "UserCreateInput",
  definition(t) {
    t.string("email", {
      required: true,
    });
    t.string("password", {
      required: true,
    });
    t.string("name");
    t.string("statusMessage");
  },
});

export const UserUpdateInputType = inputObjectType({
  name: "UserUpdateInput",
  definition(t) {
    t.string("email");
    t.string("name");
    t.string("statusMessage");
  },
});

export const Mutation = mutationType({
  definition(t) {
    t.field("signUp", {
      type: "AuthPayload",
      args: {
        user: "UserCreateInput",
      },
      resolve: async (_parent, { user }, ctx) => {
        const { name, email, password } = user;
        const hashedPassword = await hash(password, 10);
        const created = await ctx.prisma.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
          },
        });

        await ctx.prisma.note.create({
          data: {
            title: "Welcome!",
            content: "Welcome!",
            published: true,
            user: { connect: { id: created.id } },
          },
        });

        return {
          token: sign({ userId: created.id }, process.env.JWT_SECRET),
          user: created,
        };
      },
    });

    t.field("signIn", {
      type: "AuthPayload",
      args: {
        email: stringArg({ nullable: false }),
        password: stringArg({ nullable: false }),
      },
      resolve: async (_parent, { email, password }, ctx) => {
        const user = await ctx.prisma.user.findOne({
          where: {
            email,
          },
        });
        if (!user) {
          throw new Error(`No user found for email: ${email}`);
        }
        const passwordValid = await compare(password, user.password);
        if (!passwordValid) {
          throw new Error("Invalid password");
        }
        return {
          token: sign({ userId: user.id }, process.env.JWT_SECRET),
          user,
        };
      },
    });

    t.field("createDraft", {
      type: "Note",
      args: {
        title: stringArg({ nullable: false }),
        content: stringArg(),
      },
      resolve: (parent, { title, content }, ctx) => {
        isAuth(ctx);
        const userId = getUserId(ctx);
        return ctx.prisma.note.create({
          data: {
            title,
            content,
            published: true,
            user: { connect: { id: userId } },
          },
        });
      },
    });

    t.field("updateNote", {
      type: "Note",
      nullable: true,
      args: {
        id: intArg({ nullable: false }),
        content: stringArg({ nullable: false }),
      },
      resolve: async (parent, { id, content }, ctx) => {
        isAuth(ctx);

        return await ctx.prisma.note.update({
          where: { id: id },
          data: { content: content },
        });
      },
    });

    t.field("deleteNote", {
      type: "Note",
      nullable: true,
      args: { id: intArg({ nullable: false }) },
      resolve: (parent, { id }, ctx) => {
        isAuth(ctx);
        return ctx.prisma.note.delete({
          where: {
            id,
          },
        });
      },
    });
  },
});
