import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ChatWrapper from "@/components/ChatWrapper";
import PdfRenderer from "@/components/PdfRenderer";
import prisma from "@/libs/prismadb";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";

interface PageProps {
  params: {
    fileid: string;
  };
}

const page = async ({ params }: PageProps) => {
  const { fileid } = params;
  const session = await getServerSession(authOptions);
  if (!session?.user || !session.user.email) {
    redirect(`/auth-callback?origin=dashboard/${fileid}`);
  }

  // Make database call
  const userId = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
  });

  const file = await prisma.file.findFirst({
    where: {
      id: fileid,
      userId: userId?.id,
    },
  });

  if (!file) {
    notFound();
  }

  return (
    <div className="flex-1 justify-between flex flex-col h-[calc(100vh-3.5rem)]">
      <div className="mx-auto w-full max-w-8xl grow lg:flex xl:px-2">
        {/* Left Side */}
        <div className="flex-1 xl:flex">
          <div className="px-4 py-6 sm:px-6 lg_pl-8 xl:flex-1 xl:pl-6">
            <PdfRenderer url={file.url}></PdfRenderer>
          </div>
        </div>

        {/* Right hand side */}
        <div className="shrink-0 flex-[0.75] border-t border-gray-200 lg:w-96 lg:border-l lg:border-t-0">
          <ChatWrapper></ChatWrapper>
        </div>
      </div>
    </div>
  );
};

export default page;
