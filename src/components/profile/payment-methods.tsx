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
  CRYPTO_PAYOUT_CURRENCY,
  CRYPTO_PAYOUT_NETWORK,
  PAYOUT_METHOD_TYPES,
  payoutMethodConfirmLabel,
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

export function AddPayoutMethodForm({
  onDone,
  onSaved,
  onCancel,
}: {
  onDone: () => void;
  onSaved?: (method: PayoutMethod) => void;
  onCancel?: () => void;
}) {
  const form = useForm<PayoutMethodFormValues>({
    resolver: zodResolver(payoutMethodFormSchema),
    defaultValues: payoutMethodFormDefaults,
  });
  const add = useAddPayoutMethodMutation();
  const [disclaimerOpen, setDisclaimerOpen] = React.useState(false);

  const selected = form.watch("method");

  function onSubmit(values: PayoutMethodFormValues) {
    add.mutate(values, {
      onSuccess: (response) => {
        toast.success("Payment method saved");
        form.reset(payoutMethodFormDefaults);
        onSaved?.(response.method);
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
                  form.setValue("confirm_content", "");
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

        {selected === "crypto" && (
          <div className="space-y-1 rounded-lg border border-warning/40 bg-warning/5 p-3 text-sm">
            <p className="font-medium">
              We pay crypto only as {CRYPTO_PAYOUT_CURRENCY} on the {CRYPTO_PAYOUT_NETWORK} network.
            </p>
            <p className="text-muted-foreground">
              Use a wallet address that can receive {CRYPTO_PAYOUT_CURRENCY} on Ethereum. Other
              networks such as Tron (TRC-20), BNB Chain, Solana or Polygon are not supported, and
              funds sent to an address on the wrong network may be lost.
            </p>
          </div>
        )}

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{payoutMethodContentLabel(selected)}</FormLabel>
              <FormControl>
                <Input
                  type={selected === "paypal" ? "email" : "text"}
                  autoCapitalize="none"
                  autoCorrect="off"
                  autoComplete="off"
                  spellCheck={false}
                  className="h-11"
                  placeholder={PAYOUT_METHOD_PLACEHOLDERS[selected as PayoutMethodType] ?? ""}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {selected === "paypal"
                  ? "The email of the PayPal account you want paid - not necessarily the one you log in to ClipTech with."
                  : `Your Ethereum (ERC-20) address for receiving ${CRYPTO_PAYOUT_CURRENCY}. Payouts are sent by hand to exactly what you type here, so double-check it.`}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirm_content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{payoutMethodConfirmLabel(selected)}</FormLabel>
              <FormControl>
                <Input
                  type={selected === "paypal" ? "email" : "text"}
                  autoCapitalize="none"
                  autoCorrect="off"
                  autoComplete="off"
                  spellCheck={false}
                  className="h-11"
                  {...field}
                />
              </FormControl>
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
              (onCancel ?? onDone)();
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
            Crypto payouts are sent only as {CRYPTO_PAYOUT_CURRENCY} on the{" "}
            {CRYPTO_PAYOUT_NETWORK} network. Your wallet must be able to receive{" "}
            {CRYPTO_PAYOUT_CURRENCY} on Ethereum. Using an incorrect address or an address
            on another network may result in permanent loss of funds.
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
