"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";

import {
  businessLeadSchema,
  type BusinessLeadInput,
  type BusinessLeadValues,
} from "@/schemas/business-lead";
import { PROMOTION_TYPES } from "@/components/business/content";
import { Reveal } from "@/components/business/reveal";
import { Section, SectionIntro } from "@/components/business/section";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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
import { Textarea } from "@/components/ui/textarea";

const NEXT_STEPS = [
  "We review your brief and target audience.",
  "You get a proposal covering reach, targeting, timeline and pricing.",
  "Once approved, your campaign goes live within days.",
];

const EMPTY: BusinessLeadInput = {
  name: "",
  email: "",
  company: "",
  promotion: undefined as unknown as BusinessLeadInput["promotion"],
  details: "",
};

export function ProposalForm() {
  const [sent, setSent] = React.useState(false);

  const form = useForm<BusinessLeadInput, unknown, BusinessLeadValues>({
    resolver: zodResolver(businessLeadSchema),
    defaultValues: EMPTY,
  });

  async function onSubmit() {
    await new Promise((resolve) => setTimeout(resolve, 600));
    setSent(true);
  }

  return (
    <Section id="proposal" className="border-t bg-muted/40">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
        <div>
          <SectionIntro
            eyebrow="Get started"
            title="Get a campaign proposal."
            description="A plan built around your goals, within one business day."
          />
          <ol className="mt-10 space-y-5">
            {NEXT_STEPS.map((step, index) => (
              <li key={step} className="flex gap-card text-sm">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full border bg-background font-mono text-xs tabular-nums">
                  {index + 1}
                </span>
                <span className="pt-1 text-muted-foreground">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <Reveal delay={0.1} className="card-surface p-6 sm:p-8">
          {sent ? (
            <div className="flex min-h-[26rem] flex-col items-center justify-center text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-success/10">
                <CheckCircle2 className="size-6 text-success" />
              </span>
              <h3 className="mt-5 font-heading text-xl font-semibold">
                Thanks, we&apos;ve got it.
              </h3>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                We&apos;ll reply to {form.getValues("email")} within one
                business day with a proposal for your campaign.
              </p>
              <Button
                variant="outline"
                size="lg"
                className="mt-6"
                onClick={() => {
                  form.reset(EMPTY);
                  setSent(false);
                }}
              >
                Submit another brief
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                noValidate
                className="space-y-5"
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your name</FormLabel>
                        <FormControl>
                          <Input
                            className="h-11"
                            autoComplete="name"
                            placeholder="Jane Doe"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Work email</FormLabel>
                        <FormControl>
                          <Input
                            className="h-11"
                            type="email"
                            autoComplete="email"
                            placeholder="you@company.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company or agency</FormLabel>
                      <FormControl>
                        <Input
                          className="h-11"
                          autoComplete="organization"
                          placeholder="Company name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="promotion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What are you looking to promote?</FormLabel>
                      <Select
                        value={field.value ?? null}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger
                            className="w-full data-[size=default]:h-11"
                            onBlur={field.onBlur}
                          >
                            <SelectValue placeholder="Select an option">
                              {(value) => value ?? "Select an option"}
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PROMOTION_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
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
                  name="details"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Additional details{" "}
                        <span className="font-normal text-muted-foreground">
                          (optional)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          rows={4}
                          placeholder="Campaign goals, timeline, target views, audience…"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  size="xl"
                  className="h-12 w-full"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      Get a campaign proposal
                      <ArrowRight />
                    </>
                  )}
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  We typically respond within one business day.
                </p>
              </form>
            </Form>
          )}
        </Reveal>
      </div>
    </Section>
  );
}
