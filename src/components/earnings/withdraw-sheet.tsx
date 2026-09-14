"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { formatCurrency } from "@/lib/format";
import { usePayoutMethodsQuery } from "@/hooks/use-payout-methods";
import { useCreateWithdrawalMutation } from "@/hooks/use-withdrawals";
import {
  payoutMethodContent,
  payoutMethodLabel,
  type PayoutMethod,
} from "@/schemas/payout-method";
import {
  MINIMUM_WITHDRAWAL,
  withdrawalFormSchema,
  type WithdrawalFormValues,
} from "@/schemas/withdrawal";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { errorMessage } from "@/components/shared/query-state";

function methodTitle(method: PayoutMethod) {
  return method.label || payoutMethodLabel(method.method);
}

export function WithdrawSheet({
  open,
  onOpenChange,
  available,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  available: number;
}) {
  const methods = usePayoutMethodsQuery();
  const {
    mutate: requestWithdrawal,
    reset: resetWithdrawal,
    isPending,
    error: submitError,
  } = useCreateWithdrawalMutation();

  const form = useForm<WithdrawalFormValues>({
    resolver: zodResolver(withdrawalFormSchema),
    defaultValues: { amount: 0, payout_method_id: "" },
  });

  const defaultMethodId = React.useMemo(() => {
    const list = methods.data ?? [];
    return (list.find((method) => method.is_default) ?? list[0])?.id ?? "";
  }, [methods.data]);

  const wasOpen = React.useRef(false);

  React.useEffect(() => {
    if (open && !wasOpen.current) {
      form.reset({
        amount: available > 0 ? Number(available.toFixed(2)) : 0,
        payout_method_id: defaultMethodId,
      });
      resetWithdrawal();
    }
    wasOpen.current = open;
  }, [open, available, defaultMethodId, form, resetWithdrawal]);

  React.useEffect(() => {
    if (!open || !defaultMethodId) return;
    if (!form.getValues("payout_method_id")) {
      form.setValue("payout_method_id", defaultMethodId);
    }
  }, [open, defaultMethodId, form]);

  function onSubmit(values: WithdrawalFormValues) {
    requestWithdrawal(values, {
      onSuccess: () => {
        toast.success("Withdrawal requested", {
          description: "We'll review it and send the money to your payout method.",
        });
        onOpenChange(false);
      },
    });
  }

  const hasMethods = (methods.data?.length ?? 0) > 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[92svh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Withdraw earnings</SheetTitle>
          <SheetDescription>
            {formatCurrency(available)} available. Payouts are reviewed by hand before
            the money is sent.
          </SheetDescription>
        </SheetHeader>

        {!hasMethods ? (
          <div className="px-4 pb-6">
            <p className="text-sm text-muted-foreground">
              You need a payout method saved before you can withdraw. Add one from your
              profile, then come back here.
            </p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 px-4 pb-6">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        min={MINIMUM_WITHDRAWAL}
                        max={available}
                        className="h-11"
                        value={Number.isFinite(field.value) ? field.value : ""}
                        onChange={(event) => field.onChange(event.target.valueAsNumber)}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormDescription>
                      Minimum {formatCurrency(MINIMUM_WITHDRAWAL)}, up to your available
                      balance of {formatCurrency(available)}.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="payout_method_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Send it to</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="h-11 w-full">
                          <SelectValue placeholder="Choose a payout method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(methods.data ?? []).map((method) => (
                          <SelectItem key={method.id} value={method.id}>
                            {methodTitle(method)} · {payoutMethodContent(method)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {submitError && (
                <p className="text-sm text-destructive">{errorMessage(submitError)}</p>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isPending}
              >
                {isPending && <Loader2 className="animate-spin" />}
                Request withdrawal
              </Button>
            </form>
          </Form>
        )}
      </SheetContent>
    </Sheet>
  );
}
