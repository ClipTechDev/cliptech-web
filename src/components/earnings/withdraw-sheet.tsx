"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, Plus } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { AddPayoutMethodForm } from "@/components/profile/payment-methods";
import { errorMessage } from "@/components/shared/query-state";

function methodTitle(method: PayoutMethod) {
  return method.label || payoutMethodLabel(method.method);
}

function methodSummary(method: PayoutMethod) {
  const content = payoutMethodContent(method);
  return content ? `${methodTitle(method)} · ${content}` : methodTitle(method);
}

export function WithdrawSheet({
  open,
  onOpenChange,
  available,
  minimum,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  available: number;
  minimum: number;
}) {
  const methods = usePayoutMethodsQuery();
  const {
    mutate: requestWithdrawal,
    reset: resetWithdrawal,
    isPending,
    error: submitError,
  } = useCreateWithdrawalMutation();
  const [adding, setAdding] = React.useState(false);

  const schema = React.useMemo(
    () => withdrawalFormSchema(minimum, available),
    [minimum, available]
  );

  const form = useForm<WithdrawalFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { amount: 0, payout_method_id: "" },
  });

  const list = React.useMemo(() => methods.data ?? [], [methods.data]);
  const hasMethods = list.length > 0;
  const showAddForm = adding || (!methods.isPending && !hasMethods);

  const defaultMethodId = React.useMemo(
    () => (list.find((method) => method.is_default) ?? list[0])?.id ?? "",
    [list]
  );

  const wasOpen = React.useRef(false);

  React.useEffect(() => {
    if (open && !wasOpen.current) {
      form.reset({
        amount: available > 0 ? Number(available.toFixed(2)) : 0,
        payout_method_id: defaultMethodId,
      });
      resetWithdrawal();
      setAdding(false);
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

  function onMethodSaved(method: PayoutMethod) {
    form.setValue("payout_method_id", method.id, { shouldValidate: true });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[92svh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{showAddForm ? "Add a payout method" : "Withdraw earnings"}</SheetTitle>
          <SheetDescription>
            {showAddForm
              ? hasMethods
                ? "Save another place for us to send your money."
                : "Before you can withdraw, tell us where to send your money. You only need to do this once."
              : `${formatCurrency(available)} available. Payouts are reviewed by hand before the money is sent.`}
          </SheetDescription>
        </SheetHeader>

        {methods.isPending ? (
          <div className="space-y-3 px-4 pb-6">
            <Skeleton className="h-11 w-full rounded-lg" />
            <Skeleton className="h-11 w-full rounded-lg" />
          </div>
        ) : showAddForm ? (
          <div className="px-4 pb-6">
            <AddPayoutMethodForm
              onSaved={onMethodSaved}
              onDone={() => setAdding(false)}
              onCancel={hasMethods ? () => setAdding(false) : () => onOpenChange(false)}
            />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 px-4 pb-6">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Amount</FormLabel>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto px-2 py-0.5 text-xs"
                        onClick={() =>
                          form.setValue("amount", Number(available.toFixed(2)), {
                            shouldValidate: true,
                          })
                        }
                      >
                        Max
                      </Button>
                    </div>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        min={minimum}
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
                      Minimum {formatCurrency(minimum)}, up to your available
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
                          <SelectValue placeholder="Choose a payout method">
                            {(value) => {
                              const selected = list.find((method) => method.id === value);
                              return selected ? methodSummary(selected) : "Choose a payout method";
                            }}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {list.map((method) => (
                          <SelectItem key={method.id} value={method.id}>
                            {methodSummary(method)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="-ml-2 w-fit"
                      onClick={() => setAdding(true)}
                    >
                      <Plus />
                      Add a new payout method
                    </Button>
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
