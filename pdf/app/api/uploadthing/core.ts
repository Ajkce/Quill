import { getServerSession } from "next-auth";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { authOptions } from "../auth/[...nextauth]/route";
import prisma from "@/libs/prismadb";

const f = createUploadthing();

export const ourFileRouter = {
  pdfUploader: f({ pdf: { maxFileSize: "4MB" } })
    .middleware(async ({ req }) => {
      const session = await getServerSession(authOptions);
      const userId = await prisma.user.findUnique({
        where: {
          email: session?.user?.email!,
        },
      });
      if (!session?.user || !userId?.id) {
        throw new Error("Unauthorized");
      }
      return { userId: userId.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      //Add the file into our database
      const createdFile = await prisma.file.create({
        data: {
          key: file.key,
          name: file.name,
          userId: metadata.userId,
          url: `https://uploadthing-prod.s3.us-west-2.amazonaws.com/${file.key}`,
          uploadStatus: "PROCESSING",
        },
      });
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
