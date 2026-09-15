"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Wallet } from "lucide-react";
import { toast } from "sonner";

import {
  useAddPayoutMethodMutation,
  useDeletePayoutMethodMutation,
  usePayoutMethodsQuery,
  useSetDefaultPayoutMethodMutation,
} from "@/hooks/use-payout-methods";
import {
  PAYOUT_METHOD_PLACEHOLDERS,
  PAYOUT_METHOD_TYPES,
  payoutMethodContent,
  payoutMethodContentLabel,
  payoutMethodFormDefaults,
  payoutMethodFormSchema,
  payoutMethodLabel,
  type PayoutMethod,
  type PayoutMethodFormValues,
  type PayoutMethodType,
} from "@/schemas/payout-method";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { errorMessage, QueryState } from "@/components/shared/query-state";

export function PaymentMethods() {
  const { data: methods, error, isPending, refetch } = usePayoutMethodsQuery();
  const [adding, setAdding] = React.useState(false);

  const remove = useDeletePayoutMethodMutation();
  const setDefault = useSetDefaultPayoutMethodMutation();

  return (
    <QueryState
      isLoading={isPending}
      loadingFallback={
        <div className="space-y-2">
          {[0, 1].map((index) => (
            <Skeleton key={index} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      }
      error={error}
      onRetry={() => void refetch()}
    >
      <div className="space-y-3">
        {(methods?.length ?? 0) === 0 && !adding ? (
          <EmptyState
            icon={Wallet}
            title="No payment method yet"
            description="Add one so we know where to send your earnings when you withdraw."
            action={
              <Button variant="outline" size="sm" onClick={() => setAdding(true)}>
                <Plus />
                Add a method
              </Button>
            }
          />
        ) : (
          <>
            <ul className="space-y-2">
              {(methods ?? []).map((method) => (
                <PayoutMethodRow
                  key={method.id}
                  method={method}
                  onMakeDefault={() =>
                    setDefault.mutate(method.id, {
                      onSuccess: () => toast.success("Default payment method updated"),
                      onError: (error) => toast.error(errorMessage(error)),
                    })
                  }
                  settingDefault={setDefault.isPending && setDefault.variables === method.id}
                  onRemove={() =>
                    remove.mutate(method.id, {
                      onSuccess: () => toast.success("Payment method removed"),
                      onError: (error) => toast.error(errorMessage(error)),
                    })
                  }
                  removing={remove.isPending && remove.variables === method.id}
                />
              ))}
            </ul>

            {!adding && (
              <Button variant="ghost" size="sm" onClick={() => setAdding(true)}>
                <Plus />
                Add another
              </Button>
            )}
          </>
        )}

        {adding && <AddPayoutMethodForm onDone={() => setAdding(false)} />}
      </div>
    </QueryState>
  );
}

function PayoutMethodRow({
  method,
  onMakeDefault,
  settingDefault,
  onRemove,
  removing,
}: {
  method: PayoutMethod;
  onMakeDefault: () => void;
  settingDefault: boolean;
  onRemove: () => void;
  removing: boolean;
}) {
  const content = payoutMethodContent(method);

  return (
    <li className="flex items-center justify-between gap-3 rounded-xl border p-3">
      <div className="min-w-0 space-y-0.5">
        <div className="flex items-center gap-2">
          <p className="truncate font-medium">
            {method.label || payoutMethodLabel(method.method)}
          </p>
          {method.is_default && <Badge variant="success">Default</Badge>}
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {method.label ? `${payoutMethodLabel(method.method)} · ` : ""}
          {content || "No details saved"}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {!method.is_default && (
          <Button variant="outline" size="sm" disabled={settingDefault} onClick={onMakeDefault}>
            {settingDefault && <Loader2 className="animate-spin" />}
            Make default
          </Button>
        )}
        <Button variant="ghost" size="sm" disabled={removing} onClick={onRemove}>
          {removing && <Loader2 className="animate-spin" />}
          Remove
        </Button>
      </div>
    </li>
  );
}

function AddPayoutMethodForm({ onDone }: { onDone: () => void }) {
  const form = useForm<PayoutMethodFormValues>({
    resolver: zodResolver(payoutMethodFormSchema),
    defaultValues: payoutMethodFormDefaults,
  });
  const add = useAddPayoutMethodMutation();
  const [disclaimerOpen, setDisclaimerOpen] = React.useState(false);

  const selected = form.watch("method");

  function onSubmit(values: PayoutMethodFormValues) {
    add.mutate(values, {
      onSuccess: () => {
        toast.success("Payment method saved");
        form.reset(payoutMethodFormDefaults);
        onDone();
      },
      onError: (error) => toast.error(errorMessage(error)),
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-inline rounded-xl border p-card"
      >
        <FormField
          control={form.control}
          name="method"
          render={({ field }) => (
            <FormItem>
              <FormLabel>How should we pay you?</FormLabel>
              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  form.setValue("content", "");
                }}
              >
                <FormControl>
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue placeholder="Choose a method">
                      {(value) => payoutMethodLabel(String(value))}
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PAYOUT_METHOD_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {payoutMethodLabel(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{payoutMethodContentLabel(selected)}</FormLabel>
              <FormControl>
                <Input
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  className="h-11"
                  placeholder={PAYOUT_METHOD_PLACEHOLDERS[selected as PayoutMethodType] ?? ""}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Payouts are sent by hand, so double-check this - we send exactly what
                you type here.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="label"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Label (optional)</FormLabel>
              <FormControl>
                <Input className="h-11" placeholder="Main wallet" {...field} />
              </FormControl>
              <FormDescription>
                Helps you tell two of the same kind apart.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {selected === "crypto" && (
          <FormField
            control={form.control}
            name="agreedToPaymentDisclaimer"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-start gap-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(checked === true)}
                    />
                  </FormControl>
                  <FormLabel className="text-sm font-normal text-nowrap text-muted-foreground">
                    I agree to the{" "}
                    <button
                      type="button"
                      className="underline underline-offset-2 hover:text-foreground"
                      onClick={() => setDisclaimerOpen(true)}
                    >
                      Payment Disclaimer
                    </button>
                    .
                  </FormLabel>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="flex items-center gap-2">
          <Button type="submit" size="lg" disabled={add.isPending}>
            {add.isPending && <Loader2 className="animate-spin" />}
            Save method
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="lg"
            disabled={add.isPending}
            onClick={() => {
              form.reset(payoutMethodFormDefaults);
              onDone();
            }}
          >
            Cancel
          </Button>
        </div>
      </form>

      <PaymentDisclaimerSheet open={disclaimerOpen} onOpenChange={setDisclaimerOpen} />
    </Form>
  );
}

function PaymentDisclaimerSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[80svh]">
        <SheetHeader>
          <SheetTitle>Payment Disclaimer</SheetTitle>
        </SheetHeader>
        <div className="space-y-3 overflow-y-auto px-4 pb-6 text-sm text-muted-foreground">
          <p>
            Please verify your payment details carefully before submitting. You are
            responsible for providing the correct wallet address, payment ID, email, and
            network.
          </p>
          <p>
            For crypto payments, the wallet must support the exact token and network
            specified (for example, USDT on Ethereum/ERC-20). Using an incorrect address
            or network may result in permanent loss of funds.
          </p>
          <p>
            Once a payment is sent, it may not be reversible. We are not responsible for
            funds lost, delayed, or inaccessible due to incorrect payment details provided
            by you.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
