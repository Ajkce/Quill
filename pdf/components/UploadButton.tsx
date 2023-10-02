"use client";

import { Dialog, DialogTrigger } from "@radix-ui/react-dialog";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { DialogContent } from "./ui/dialog";


import UploadDropZone from "./UploadDropZone";

const UploadButton = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <Dialog
      open-={isOpen}
      onOpenChange={(v) => {
        if (!v) {
          setIsOpen(v);
        }
      }}
    >
      <DialogTrigger asChild onClick={() => setIsOpen(true)}>
        <Button>Upload PDF</Button>
      </DialogTrigger>

      <DialogContent><UploadDropZone></UploadDropZone></DialogContent>
    </Dialog>
  );
};

export default UploadButton;
