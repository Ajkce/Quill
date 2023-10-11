import { privateProcedure, publicProcedure, router } from "./trpc";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { TRPCError } from "@trpc/server";
import prisma from "@/libs/prismadb";
import { z } from "zod";
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query";
import { Dai_Banna_SIL } from "next/font/google";

export const appRouter = router({
  authCallback: publicProcedure.query(async () => {
    const session = await getServerSession(authOptions);
    if (session?.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    const userId = await prisma.user.findUnique({
      where: {
        email: session?.user?.email!,
      },
    });
    const dbUser = await prisma.user.findFirst({
      where: {
        id: userId?.id,
      },
    });

    return { success: true };
  }),

  getUserFiles: privateProcedure.query(async ({ ctx }) => {
    const { user } = ctx;
    const userId = await prisma.user.findUnique({
      where: {
        email: user?.email!,
      },
    });
    return await prisma.file.findMany({
      where: {
        userId: userId?.id,
      },
    });
  }),

  getFileMessages: privateProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
        fileId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { userId } = ctx;
      const { fileId, cursor } = input;
      const limit = input.limit ?? INFINITE_QUERY_LIMIT;

      const file = await prisma.file.findFirst({
        where: {
          id: fileId,
          userId,
        },
      });
      if (!file) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const messages = await prisma.message.findMany({
        take: limit + 1,
        where: {
          fileId,
        },
        orderBy: {
          createdAt: "desc",
        },
        cursor: cursor ? { id: cursor } : undefined,
        select: {
          id: true,
          isUserMessage: true,
          createdAt: true,
          text: true,
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;

      if (messages.length > limit) {
        const nextItem = messages.pop();
        nextCursor = nextItem?.id;
      }

      return {
        messages,
        nextCursor,
      };
    }),

  getFileUploadStatus: privateProcedure
    .input(z.object({ fileId: z.string() }))
    .query(async ({ input, ctx }) => {
      const file = await prisma.file.findFirst({
        where: {
          id: input.fileId,
          userId: ctx.userId,
        },
      });
      if (!file) {
        return {
          status: "PENDING" as const,
        };
      }
      return {
        status: file.uploadStatus,
      };
    }),

  getFile: privateProcedure
    .input(z.object({ key: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      const file = await prisma.file.findFirst({
        where: {
          key: input.key,
          userId,
        },
      });
      if (!file) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return file;
    }),

  deleteFile: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      const file = await prisma.file.findFirst({
        where: {
          id: input.id,
          userId,
        },
      });

      if (!file) throw new TRPCError({ code: "NOT_FOUND" });

      await prisma.file.delete({
        where: {
          id: input.id,
        },
      });

      return file;
    }),
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
