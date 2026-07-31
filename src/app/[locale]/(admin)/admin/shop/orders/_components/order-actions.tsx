"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Eye, MoreHorizontal, Loader2, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Link } from "@/i18n/navigation";
import { OrderPlain } from "./columns";
import { softDeleteOrder } from "@/actions/order";

export function OrderActions({ order }: { order: OrderPlain }) {
  const [isPending, startTransition] = useTransition();
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const handleDelete = () => {
    startTransition(async () => {
      const result = await softDeleteOrder(order.id);
      if (result?.success) {
        toast.success(result.message);
        setIsAlertOpen(false);
      } else {
        toast.error(result?.message ?? "Помилка");
        setIsAlertOpen(false);
      }
    });
  };

  return (
    <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
            <span className="sr-only">Відкрити меню дій</span>
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <MoreHorizontal className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Дії</DropdownMenuLabel>
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link href={`/admin/shop/orders/${order.id}`}>
              <Eye className="mr-2 h-4 w-4" />
              Оглянути
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <AlertDialogTrigger asChild>
            <DropdownMenuItem
              className="text-red-500 focus:text-red-600 focus:bg-red-500/10 cursor-pointer"
              onSelect={(e) => e.preventDefault()}
            >
              <Archive className="mr-2 h-4 w-4" />
              В архів
            </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Переміщення в архів</AlertDialogTitle>
          <AlertDialogDescription>
            Замовлення{" "}
            <strong>
              {order.firstName} {order.lastName}
            </strong>{" "}
            на суму <strong>{order.totalPrice} ₴</strong> буде приховане з таблиці. Відновити можна
            через архів.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Скасувати</AlertDialogCancel>
          <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
            {isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            {isPending ? "Архівація..." : "В архів"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}