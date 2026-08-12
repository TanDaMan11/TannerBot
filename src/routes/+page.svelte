<svelte:head>
  <title>TannerBot</title>
  <meta name="description" content="Meet TannerBot — a helpful conversation, just one text away." />
</svelte:head>

<script lang="ts">
  const appleUrl = 'https://bcrw.apple.com/urn:biz:76d21f9c-3f2b-42e4-b939-d33120af21e8';
</script>

<main>
  <section class="hero" aria-labelledby="title">
    <div class="orb" aria-hidden="true"></div>
    <p class="eyebrow">Always ready to chat</p>
    <h1 id="title">TannerBot</h1>
    <p class="intro">A little help, a quick answer, or a friendly conversation — just a text away.</p>
    <a class="button" href={appleUrl}>Try Now <span aria-hidden="true">→</span></a>
  </section>
</main>

<style>
  :global(*) { box-sizing: border-box; }
  :global(body) { margin: 0; background: #f7f8fc; color: #171927; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
  main { min-height: 100vh; display: grid; place-items: center; padding: 2rem; overflow: hidden; }
  .hero { position: relative; width: min(100%, 680px); padding: clamp(3.5rem, 10vw, 7rem) 2rem; text-align: center; }
  .orb { position: absolute; z-index: -1; width: 360px; height: 360px; top: 50%; left: 50%; transform: translate(-50%, -54%); border-radius: 50%; background: radial-gradient(circle at 35% 30%, #d9e7ff, #e6ddff 48%, rgba(247, 248, 252, 0) 72%); filter: blur(4px); opacity: .9; }
  .eyebrow { margin: 0 0 1.25rem; color: #6671a3; font-size: .78rem; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; }
  h1 { margin: 0; font-size: clamp(3.5rem, 12vw, 7rem); line-height: .95; letter-spacing: -.07em; font-weight: 800; }
  .intro { max-width: 430px; margin: 1.75rem auto 2.25rem; color: #5d6174; font-size: 1.1rem; line-height: 1.6; }
  .button { display: inline-flex; align-items: center; gap: .7rem; padding: .9rem 1.35rem; border-radius: 999px; background: #171927; color: white; font-weight: 700; text-decoration: none; transition: transform .2s ease, box-shadow .2s ease; box-shadow: 0 10px 24px rgba(23, 25, 39, .16); }
  .button:hover, .button:focus-visible { transform: translateY(-2px); box-shadow: 0 14px 28px rgba(23, 25, 39, .22); }
  .button span { font-size: 1.2rem; line-height: 1; }
</style>
