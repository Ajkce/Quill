import { Cloud, Divide, File, Loader2 } from "lucide-react";
import React, { useState } from "react";
import DropZone from "react-dropzone";
import { Progress } from "./ui/progress";
import { resolve } from "path";
import { useUploadThing } from "@/libs/uploadthing";
import toast from "react-hot-toast";
import { useToast } from "./ui/use-toast";
import { trpc } from "@/app/_trpc/client";
import { useRouter } from "next/navigation";

const UploadDropZone = () => {
  const router = useRouter();

  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgess, setUploadProgress] = useState<number>(0);

  const { toast } = useToast();
  const { startUpload } = useUploadThing("pdfUploader");

  const { mutate: StartPooling } = trpc.getFile.useMutation({
    onSuccess: (file) => {
      router.push(`/dashboard/${file.id}`);
    },
    retry: true,
    retryDelay: 500,
  });

  const startSimulatedProgress = () => {
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return prev;
        }
        return prev + 5;
      });
    }, 500);
    return interval;
  };

  return (
    <DropZone
      multiple={false}
      onDrop={async (acceptedFile) => {
        console.log(acceptedFile);
        setIsUploading(true);

        const progressInterval = startSimulatedProgress();

        //Handle file upload
        const res = await startUpload(acceptedFile);
        if (!res) {
          return toast({
            title: "Something went wrong",
            description: "Please try again later",
            variant: "destructive",
          });
        }

        const [fileResponse] = res;

        const key = fileResponse.key;

        if (!key) {
          return toast({
            title: "Something went wrong",
            description: "Please try again later",
            variant: "destructive",
          });
        }

        clearInterval(progressInterval);
        setUploadProgress(100);

        StartPooling({ key });
      }}
    >
      {({ getRootProps, getInputProps, acceptedFiles }) => (
        <div
          {...getRootProps()}
          className="border h-64 m-4 border-dashed border-gray-300 rounded-lg"
        >
          <div className="flex items-center justify-center h-full w-full">
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-full h-full rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Cloud className="h-6 w-6 text-zinc-500 mb-2"></Cloud>
                <p className="mb-2 text-sm text-zinc-700">
                  <span className="font-semibold">Click to upload </span>
                  or drag and drop
                </p>
                <p className="text-xs text-zinc-500">PDF (up to 4mb)</p>
              </div>

              {acceptedFiles && acceptedFiles[0] ? (
                <div className="max-w-xs bg-white flex items-center rounded-md overflow-hidden outline outline-[1px] outline-zinc-200 divide-x divide-zinc-200">
                  <div className="px-3 py-2 h-full grid place-items-center">
                    <File className="h-4 w-4 text-blue-500"></File>
                  </div>
                  <div className="px-3 py-2 h-full text-sm truncate">
                    {acceptedFiles[0].name}
                  </div>
                </div>
              ) : null}

              {isUploading ? (
                <div className="w-full mt-4 max-w-sm mx-auto">
                  <Progress
                    indicatorColor={uploadProgess === 100 ? "bg-green-500" : ""}
                    value={uploadProgess}
                    className="h-1 w-full bg-zinc-200"
                  />
                  {uploadProgess === 100 ? (
                    <div className="flex gap-1 items-center justify-center text-sm text-zinc-700 text-center ">
                      <Loader2 className="h-3 w-3 animate-spin"></Loader2>
                      Redirecting...
                    </div>
                  ) : null}
                </div>
              ) : null}
              <input
                {...getInputProps()}
                type="file"
                id="dropzone-file"
                className="hidden"
              ></input>
            </label>
          </div>
        </div>
      )}
    </DropZone>
  );
};

export default UploadDropZone;
