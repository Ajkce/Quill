"use client";

import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useToast } from "./ui/use-toast";
import { useResizeDetector } from "react-resize-detector";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/libs/utils";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

interface pdfRendererProps {
  url: string;
}

const PdfRenderer = ({ url }: pdfRendererProps) => {
  const { toast } = useToast();
  const { width, ref } = useResizeDetector();
  const [numPages, setNumPages] = useState<number>();
  const [currPage, setCurrPage] = useState<number>(1);

  const customPageValidator = z.object({
    page: z
      .string()
      .refine((num) => Number(num) > 0 && Number(num) <= numPages!),
  });
  type TCustomPageValidator = z.infer<typeof customPageValidator>;

  const {
    getValues,
    handleSubmit,
    formState: { errors },
    setValue,
    register,
  } = useForm<TCustomPageValidator>({
    defaultValues: {
      page: "1",
    },
    resolver: zodResolver(customPageValidator),
  });

  const handlePageSubmit = ({ page }: TCustomPageValidator) => {
    setCurrPage(Number(page));
    setValue("page", page);
  };

  return (
    <div className="w-full bg-white rounded-md shadow flex flex-col items-center">
      <div className="h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2">
        <div className="flex items-center gap-1.5">
          <Button
            aria-label="previous page"
            variant="ghost"
            disabled={currPage <= 1}
            onClick={() => {
              setCurrPage((prev) => {
                const page = prev - 1 > 1 ? prev - 1 : 1;
                setValue("page", String(page));
                return page;
              });
            }}
          >
            <ChevronDown></ChevronDown>
          </Button>

          <div className="flex items-center gap-1.5">
            <Input
              {...register("page")}
              className={
                (cn("w-12 h-8"), errors.page && "focus-visible:ring-red-500")
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSubmit(handlePageSubmit)();
                }
              }}
            ></Input>
            <p className="text-zinc-700 text-sm space-x-1">
              <span>/</span>
              <span>{numPages ?? "x"}</span>
            </p>
          </div>
          <Button
            aria-label="next page"
            variant="ghost"
            disabled={numPages === undefined || currPage === numPages}
            onClick={async () => {
              setCurrPage((prev) => {
                const page = prev + 1 > numPages! ? numPages! : prev + 1;
                setValue("page", String(page));
                return page;
              });
            }}
          >
            <ChevronUp></ChevronUp>
          </Button>
        </div>
      </div>
      <div className="flex-1 w-full max-h-screen ">
        <div ref={ref}>
          <Document
            loading={
              <div className="flex justify-center">
                <Loader2 className="my-24 h-6 w-6 animate-spin"></Loader2>
              </div>
            }
            onLoadError={() => {
              toast({
                title: "Error loading PDF",
                description: "Please try again",
                variant: "destructive",
              });
            }}
            onLoadSuccess={({ numPages }) => {
              setNumPages(numPages);
            }}
            className="max-h-full"
            file={url}
          >
            <Page width={width ? width : 1} pageNumber={currPage}>
              {" "}
            </Page>
          </Document>
        </div>
      </div>
    </div>
  );
};

export default PdfRenderer;
