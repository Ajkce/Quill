// "use client";

// import { authOptions } from "@/app/api/auth/[...nextauth]/route";
// import { TRPCError, initTRPC } from "@trpc/server";
// import { getServerSession } from "next-auth/next";
// import { useSession } from "next-auth/react";
// /**
//  * Initialization of tRPC backend
//  * Should be done only once per backend!
//  */
// const t = initTRPC.create();
// /**
//  * Export reusable router and procedure helpers
//  * that can be used throughout the router
//  */
// const middleware = t.middleware;
// const isAuth = middleware(async (opts) => {
//   const { data: session, status } = useSession();

//   if (!session) {
//     throw new TRPCError({ code: "UNAUTHORIZED" });
//   }

//   const user = session.user;
//   return opts.next({
//     ctx: {
//       user,
//     },
//   });
// });

// export const router = t.router;
// export const publicProcedure = t.procedure;
// export const privateProcedure = t.procedure.use(isAuth);

import { getServerSession } from "next-auth/next";
import { TRPCError, initTRPC } from "@trpc/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/libs/prismadb";

const t = initTRPC.create();
const middleware = t.middleware;

const isAuth = middleware(async (opts) => {
  const session = await getServerSession(authOptions);
  const sessionuser = session?.user;

  const user = await prisma.user.findUnique({
    where: {
      email: sessionuser?.email!,
    },
  });

  if (!user || !user.id) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return opts.next({
    ctx: {
      userId: user.id,
      user,
    },
  });
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const privateProcedure = t.procedure.use(isAuth);
