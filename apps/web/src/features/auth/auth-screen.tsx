"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { emailSchema } from "@mealhrs/contracts";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { useCustomerContext } from "@/lib/customer-context";
import styles from "@/features/account/account.module.css";

const schema = z.object({ email: emailSchema });
type FormValues = z.infer<typeof schema>;

export function AuthScreen() {
  const router = useRouter();
  const { pendingIntent, setPendingIntent, setSignedIn } = useCustomerContext();
  const [mode, setMode] = useState<"signin" | "create">("signin");
  const [message, setMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const { formState: { errors, isSubmitting, isValid }, handleSubmit, register, reset } = useForm<FormValues>({
    defaultValues: { email: "" },
    mode: "onChange",
    resolver: zodResolver(schema),
  });

  const changeMode = (next: "signin" | "create") => {
    setMode(next);
    setMessage("");
    setSubmitError("");
    reset({ email: "" });
  };

  const onSubmit = handleSubmit(async ({ email }) => {
    setSubmitError("");
    setMessage("Checking your details…");
    await new Promise((resolve) => window.setTimeout(resolve, 450));
    if (email.toLowerCase().startsWith("error")) {
      setMessage("");
      setSubmitError("We couldn’t complete this preview. Check the address or try again.");
      return;
    }
    setSignedIn(true);
    const destination = pendingIntent ?? "/profile";
    setPendingIntent(null);
    setMessage(mode === "signin" ? "Signed in for this preview." : "Account created for this preview.");
    router.push(destination);
  });

  const previewAlternative = (label: string) => {
    setSubmitError("");
    setMessage(`${label} is represented as a frontend preview. No account was created.`);
  };

  return (
    <div className={styles.accountHero}>
      <section className={styles.authMedia} aria-label="MealHrs food discovery">
        <div className={styles.authMediaCopy}>
          <p className={styles.eyebrow} style={{ color: "#fff" }}>Food worth finding</p>
          <p className={styles.authPromise}>Follow kitchens you love. Order when it matters.</p>
          <p>From meals available now to Sunday drops planned ahead.</p>
        </div>
      </section>
      <section className={styles.authPanel}>
        <div className={styles.authBox}>
          <Logo className={styles.authBrand ?? ""} />
          <div className={styles.authTabs} role="group" aria-label="Account mode">
            <button type="button" aria-pressed={mode === "signin"} onClick={() => changeMode("signin")}>Sign in</button>
            <button type="button" aria-pressed={mode === "create"} onClick={() => changeMode("create")}>Create account</button>
          </div>
          <h1>{mode === "signin" ? "Welcome back" : "Create your account"}</h1>
          <p className={styles.intro}>{mode === "signin" ? "Sign in to order, follow kitchens and keep your saved meals together." : "Save meals, follow kitchens and keep every order in one place."}</p>
          <button className={styles.socialButton} type="button" onClick={() => previewAlternative("Google sign-in")}>Continue with Google</button>
          <div className={styles.or}>or continue with email</div>
          <form className={styles.formStack} onSubmit={onSubmit} noValidate>
            {submitError ? <div className={styles.warning} role="alert" tabIndex={-1}>{submitError}</div> : null}
            <label className={styles.field}>
              <span>Email address</span>
              <input
                className={styles.input}
                type="email"
                autoComplete="email"
                placeholder="teni@example.com"
                aria-invalid={errors.email ? "true" : "false"}
                aria-describedby={errors.email ? "email-error" : "email-hint"}
                {...register("email")}
              />
              {errors.email ? <small className={styles.error} id="email-error">{errors.email.message}</small> : <small className={styles.hint} id="email-hint">Enter a valid email to continue.</small>}
            </label>
            <Button block type="submit" disabled={!isValid || isSubmitting} aria-disabled={!isValid || isSubmitting}>
              {isSubmitting ? "Please wait…" : "Continue"}
            </Button>
          </form>
          <Button block variant="ghost" type="button" onClick={() => previewAlternative("Verified phone sign-in")}>Use verified phone number</Button>
          <div className={styles.live} role="status" aria-live="polite">{message}</div>
          <p className={styles.legal}>By continuing, you agree to MealHrs’ customer terms and privacy notice.</p>
          <p className={styles.simulation}>Frontend preview only. No authentication request is sent.</p>
        </div>
      </section>
    </div>
  );
}
