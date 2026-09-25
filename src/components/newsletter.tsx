"use client";

import { useState } from "react";
import { subscribe } from "@/lib/subscribe";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  return (
    <section
      id="newsletter"
      className="mx-[18px] mb-7 flex flex-col gap-3.5 rounded-[18px] border border-ink/12 p-5 lg:mx-16 lg:mb-16 lg:flex-row lg:items-center lg:justify-between lg:gap-10 lg:rounded-[20px] lg:px-10 lg:py-9"
    >
      <div className="flex max-w-[460px] flex-col gap-1 lg:gap-1.5">
        <span className="font-serif text-[19px] font-semibold lg:text-[22px]">
          One odd fact, every morning.
        </span>
        <span className="text-[13px] text-faded lg:text-[15px]">
          <span className="lg:hidden">Free. Unsubscribe anytime.</span>
          <span className="hidden lg:inline">
            Free. No spam. Unsubscribe in one click.
          </span>
        </span>
      </div>
      <form
        className="flex flex-col gap-2.5 lg:flex-row"
        onSubmit={async (event) => {
          event.preventDefault();
          setPending(true);
          setMessage("");
          const result = await subscribe(email);
          setPending(false);
          if (result.ok) {
            setEmail("");
            setMessage("You're in.");
            return;
          }
          setMessage(result.message);
        }}
      >
        <input
          type="email"
          required
          value={email}
          placeholder="you@example.com"
          aria-label="Email address"
          onChange={(event) => setEmail(event.target.value)}
          className="box-border h-[46px] rounded-[10px] border border-ink/20 bg-white px-3.5 font-sans text-[15px] outline-none lg:w-[260px] lg:px-4"
        />
        <button
          type="submit"
          disabled={pending}
          className="h-[46px] rounded-[10px] bg-accent px-[22px] text-[15px] font-bold text-ink disabled:opacity-60"
        >
          Sign up
        </button>
        {message ? (
          <p className="m-0 text-[13px] text-faded lg:basis-full">{message}</p>
        ) : null}
      </form>
    </section>
  );
}
