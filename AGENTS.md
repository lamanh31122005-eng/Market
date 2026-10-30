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
- Checkout/orders sit under _authenticated; login page takes ?redirect= (sanitized via safeRedirect).
