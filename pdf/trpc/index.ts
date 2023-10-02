import { privateProcedure, publicProcedure, router } from "./trpc";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { TRPCError } from "@trpc/server";
import prisma from "@/libs/prismadb";
import { z } from "zod";

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
