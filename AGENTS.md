<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Cart lives in browser localStorage (src/lib/cart.tsx) so guests keep it through login; order totals are recomputed server-side in placeOrder.
- Chatbot replies tag products as [[slug]]; ChatWidget turns tags into add-to-cart cards. Catalog is injected into the prompt server-side.
- Chatbot runs on Cloudflare Workers AI (@cf/meta/llama-3.1-8b-instruct) via the connector gateway in sendChat, per user request for free AI; the prompt must restate grounding rules forcefully because the small model follows them weakly.
- Chatbot public catalog reads use a per-request publishable client; unknown product tags are removed server-side so failed reads cannot create purchase recommendations.
- Category navigation and imagery are driven by the shared catalog; empty categories remain browsable without fabricated product rows or prices.
- Checkout/orders sit under _authenticated; login page takes ?redirect= (sanitized via safeRedirect).
- Product price management uses authenticated server functions and database-backed admin roles with column-scoped UPDATE grants; only authorized administrators can change prices.
