import { intArg, queryType, stringArg } from "@nexus/schema";

import { getUserId, isAuth } from "../../utils";

export const Query = queryType({
  definition(t) {
    t.field("loadUser", {
      type: "User",
      nullable: true,
      resolve: (parent, args, ctx) => {
        isAuth(ctx);
        const userId = getUserId(ctx);

        return ctx.prisma.user.findOne({
          where: {
            id: userId,
          },
        });
      },
    });

    t.list.field("feed", {
      type: "Note",
      resolve: async (parent, args, ctx) => {
        isAuth(ctx);

        const notes = await ctx.prisma.user
          .findOne({
            where: {
              id: getUserId(ctx),
            },
          })
          .notes();
        return notes;
      },
    });

    t.list.field("filterNotes", {
      type: "Note",
      args: {
        searchString: stringArg({ nullable: true }),
      },
      resolve: (parent, { searchString }, ctx) => {
        isAuth(ctx);
        return ctx.prisma.note.findMany({
          where: {
            OR: [
              {
                title: {
                  contains: searchString,
                },
              },
              {
                content: {
                  contains: searchString,
                },
              },
            ],
          },
        });
      },
    });

    t.field("note", {
      type: "Note",
      nullable: true,
      args: { id: intArg() },
      resolve: async (parent, { id }, ctx) => {
        isAuth(ctx);
        const note = await ctx.prisma.note.findOne({
          where: {
            id: Number(id),
          },
          include: {
            user: {
              select: {
                id: true,
              },
            },
          },
        });
        if (getUserId(ctx) !== note.user.id) {
          throw new Error("Permission Error");
        }
        return note;
      },
    });
  },
});