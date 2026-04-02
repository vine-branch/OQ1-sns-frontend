"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { createContext, useCallback, useContext, useState } from "react";

interface AlertState {
  open: boolean;
  message: string;
  onClose?: () => void;
}

const AlertContext = createContext<
  (message: string, onClose?: () => void) => void
>(() => {});

export function useAlert() {
  return useContext(AlertContext);
}

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AlertState>({
    open: false,
    message: "",
  });

  const showAlert = useCallback((message: string, onClose?: () => void) => {
    setState({ open: true, message, onClose });
  }, []);

  const handleClose = useCallback(() => {
    setState((prev) => {
      prev.onClose?.();
      return { open: false, message: "", onClose: undefined };
    });
  }, []);

  return (
    <AlertContext.Provider value={showAlert}>
      {children}
      <AlertDialog
        open={state.open}
        onOpenChange={(open) => !open && handleClose()}
      >
        <AlertDialogContent>
          <div className="px-5 pt-5 pb-4 text-center">
            <AlertDialogTitle className="sr-only">알림</AlertDialogTitle>
            <AlertDialogDescription className="text-[13px] text-gray-800 leading-relaxed">
              {state.message}
            </AlertDialogDescription>
          </div>
          <div className="border-t border-gray-200/80">
            <AlertDialogAction onClick={handleClose}>확인</AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </AlertContext.Provider>
  );
}
