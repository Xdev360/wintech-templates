import type { CSSProperties, ReactNode } from "react";
import { CategoryBar } from "./CategoryBar";
import { BuyButton, Checkout } from "./Checkout";
import { EnquiryForm } from "./EnquiryForm";
import { inkFor, readable, safeAccent } from "@/lib/color";
import { sectionFor } from "@/lib/site-nav";
import { defaultContent, type SectionKey, type SiteContent, type SiteItem } from "@/lib/site-model";
import type { Art, TemplateDef } from "@/lib/templates";

/* ──────────────────────────────────────────────────────────────
   Renders a site: a template's design with some content.

   The same component draws the template gallery (sample content, as a
   scaled, inert preview) and every customer's live site (their content,
   with real links). The template decides the look; the content decides
   what is on the page, in which order.

   Every section sits in its own container: a floating nav, a hero card,
   cards for stats, products, services, and quotes, a colour block for
   the call to action. Layout uses container queries, so the same markup
   is a desktop site in a thumbnail and a phone site in a phone.
   ────────────────────────────────────────────────────────────── */

const FONTS = {
  sans: "var(--font-inter-tight), ui-sans-serif, system-ui, sans-serif",
  serif: '"Iowan Old Style", "Palatino Linotype", Palatino, "Book Antiqua", Georgia, serif',
  mono: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
};

/** Marks an element with the content field behind it, or with nothing. */
type Tag = (path: string) => Record<string, string>;

function vars(t: TemplateDef, accent: string, accent2: string): CSSProperties {
  const th = t.theme;
  const a = safeAccent(accent);
  const b = safeAccent(accent2 || th.hues[1]);
  return {
    "--t-bg": th.bg,
    "--t-surface": th.surface,
    "--t-ink": th.ink,
    "--t-mute": th.mute,
    "--t-line": th.line,
    "--t-accent": a,
    "--t-accent-ink": inkFor(a),
    // Buttons carry the brand hue, nudged just far enough to be read.
    "--t-btn": readable(a).fill,
    "--t-btn-ink": readable(a).ink,
    "--t-accent-2": b,
    "--t-accent-2-ink": inkFor(b),
    "--t-r": `${th.radius}px`,
    "--t-dw": th.displayWeight,
    "--t-display": FONTS[th.display],
    "--t-body": FONTS.sans,
    "--h1": a,
    "--h2": b,
    "--h3": th.hues[2],
    "--h4": th.hues[3],
  } as CSSProperties;
}

/** A button: a real link on a live site, a plain shape in a preview
 *  (previews sit inside links, and a link inside a link is invalid). */
function Btn({ live, href, className = "", children }: { live?: boolean; href?: string; className?: string; children: ReactNode }) {
  const cls = `tpl-btn ${className}`;
  return live && href ? <a href={href} className={cls}>{children}</a> : <span className={cls}>{children}</span>;
}

export function TemplateSite({
  template,
  content,
  live = false,
  only,
  editable = false,
  slug,
}: {
  template: TemplateDef;
  content?: SiteContent;
  live?: boolean;
  /** Draw one section on its own, with no nav, hero, or footer. The
   *  "add a section" picker uses it to show what each one looks like. */
  only?: SectionKey;
  /** Tag every changeable word and photo with the field it belongs to, so
   *  the editor can let someone click the page itself and type. */
  editable?: boolean;
  /** The site's link. With it, the last section takes real messages. */
  slug?: string;
}) {
  const c = content ?? defaultContent(template);
  /** `at("hero.headline")` marks a word for the editor, and is nothing at all
   *  on a live site or a thumbnail. */
  const at: Tag = (path) => (editable ? { "data-edit": path } : ({} as Record<string, string>));
  const pic: Tag = (path) => (editable ? { "data-edit-image": path } : ({} as Record<string, string>));
  /* Where a button goes. An owner who has filled in nothing still gets
     working buttons: they land on the message form at the foot of the
     page, which is better than a dead button or a mail app nobody on a
     phone has set up. */
  const reach =
    c.hero.ctaHref ||
    (c.sections.includes("contact") ? "#contact" : c.brand.email ? `mailto:${c.brand.email}` : c.brand.phone ? `tel:${c.brand.phone}` : "");
  const goTo = (word: string) => sectionFor(word, c.sections);
  const second = c.nav[0] && !c.hero.cta.toLowerCase().includes(c.nav[0].toLowerCase()) ? c.nav[0] : c.nav[1];

  const blocks: Record<SectionKey, ReactNode> = {
    stats: c.stats.length ? (
      <section className="tpl-wrap" id="stats" key="stats">
        <div className="tpl-card tpl-stats">
          {c.stats.map((s, i) => (
            <div key={s.label}><b {...at(`stats.${i}.value`)}>{s.value}</b><span {...at(`stats.${i}.label`)}>{s.label}</span></div>
          ))}
        </div>
      </section>
    ) : null,
    items: c.items.list.length ? (
      <section className="tpl-sec" id="items" key="items">
        <div className="tpl-wrap">
          <Head title={c.items.title} at={at("items.title")} />
          <Items template={template} items={c.items.list} live={live} reach={reach} slug={slug} at={at} pic={pic} />
          {c.items.note ? <p className="tpl-note" {...at("items.note")}>{c.items.note}</p> : null}
        </div>
      </section>
    ) : null,
    about: c.about.body ? (
      <section className="tpl-sec" id="about" key="about">
        <div className="tpl-wrap">
          <div className="tpl-card tpl-about">
            <div>
              <p className="tpl-eyebrow">About</p>
              <h2 className="tpl-h2" {...at("about.title")}>{c.about.title}</h2>
              <p className="tpl-sub" {...at("about.body")}>{c.about.body}</p>
            </div>
            <div className="tpl-about__art" aria-hidden="true"><span /><span /><span /></div>
          </div>
        </div>
      </section>
    ) : null,
    testimonials: c.testimonials.length ? (
      <section className="tpl-sec" id="testimonials" key="testimonials">
        <div className="tpl-wrap">
          <Head title="What people say" />
          <div className="tpl-quotes">
            {c.testimonials.map((t, i) => (
              <figure key={t.name} className="tpl-card tpl-quote">
                <blockquote {...at(`testimonials.${i}.quote`)}>“{t.quote}”</blockquote>
                <figcaption>
                  <span className="tpl-avatar" aria-hidden="true">{t.name.slice(0, 1)}</span>
                  <span><b {...at(`testimonials.${i}.name`)}>{t.name}</b><small {...at(`testimonials.${i}.role`)}>{t.role}</small></span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    ) : null,
    faq: c.faq.length ? (
      <section className="tpl-sec" id="faq" key="faq">
        <div className="tpl-wrap tpl-faq-wrap">
          <Head title="Questions" />
          <div className="tpl-faq">
            {c.faq.map((f, i) => (
              <details key={f.q} className="tpl-card tpl-faq__item" open={!live && i === 0}>
                <summary {...at(`faq.${i}.q`)}>{f.q}</summary>
                <p {...at(`faq.${i}.a`)}>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    ) : null,
    contact: (
      <section className="tpl-sec" id="contact" key="contact">
        <div className="tpl-wrap">
          <div className="tpl-cta">
            <div>
              <h2 className="tpl-h2" {...at("contact.title")}>{c.contact.title}</h2>
              <p {...at("contact.line")}>{c.contact.line}</p>
            </div>
            {slug ? (
              <EnquiryForm slug={slug} cta={c.hero.cta} live={live} />
            ) : template.id === "landing-waitlist" ? (
              <div className="tpl-waitlist">
                <span className="tpl-field">you@email.com</span>
                <Btn live={live} href={reach} className="tpl-btn--invert">{c.hero.cta}</Btn>
              </div>
            ) : (
              <Btn live={live} href={reach} className="tpl-btn--invert">{c.hero.cta}</Btn>
            )}
          </div>
        </div>
      </section>
    ),
  };

  if (only) {
    return (
      <div className="tpl tpl--single" style={vars(template, c.theme.accent, c.theme.accent2)}>
        {blocks[only] ?? <p className="tpl-wrap tpl-note">Nothing in this section yet.</p>}
      </div>
    );
  }

  return (
    // Motion belongs to a real site being read, not to a thumbnail in the
    // gallery or a page being edited, where things sliding about would be
    // noise. One class decides it.
    <div className={`tpl${live && !editable ? " tpl--live" : ""}`} style={vars(template, c.theme.accent, c.theme.accent2)}>
      {slug ? <Checkout slug={slug} live={live} /> : null}
      <div className="tpl-wrap" id="top">
        <header className="tpl-nav">
          <span className="tpl-brand">
            {c.brand.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={c.brand.logoUrl} alt="" />
            ) : (
              <i aria-hidden="true">{c.brand.name.slice(0, 1)}</i>
            )}
            {c.brand.name}
          </span>
          <nav className="tpl-links">
            {c.nav.map((n) => (live ? <a key={n} href={goTo(n)}>{n}</a> : <span key={n}>{n}</span>))}
          </nav>
          <Btn live={live} href={reach} className="tpl-btn--sm">{c.hero.cta}</Btn>
        </header>
      </div>

      <div className="tpl-wrap">
        <section className="tpl-hero" id="hero">
          <div className="tpl-hero__copy">
            {c.hero.eyebrow ? <p className="tpl-eyebrow" {...at("hero.eyebrow")}>{c.hero.eyebrow}</p> : null}
            <h1 className="tpl-h1" {...at("hero.headline")}>{c.hero.headline}</h1>
            {c.hero.sub ? <p className="tpl-sub" {...at("hero.sub")}>{c.hero.sub}</p> : null}
            <div className="tpl-actions">
              <Btn live={live} href={reach}>{c.hero.cta}</Btn>
              {second ? <Btn live={live} href={goTo(second)} className="tpl-btn--ghost">{second}</Btn> : null}
            </div>
            {template.engine === "reservation" ? <ReserveBar /> : null}
          </div>
          {c.hero.image ? (
            <div className="tpl-art tpl-art--photo" {...pic("hero.image")}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.hero.image} alt="" />
            </div>
          ) : (
            <span {...pic("hero.image")}><ArtPanel art={template.site.art} template={template} /></span>
          )}
        </section>
      </div>

      {c.sections.map((k) => blocks[k])}

      <footer className="tpl-foot">
        <div className="tpl-wrap">
          <div className="tpl-foot__grid">
            <div>
              <span className="tpl-brand"><i aria-hidden="true">{c.brand.name.slice(0, 1)}</i>{c.brand.name}</span>
              <p>{c.hero.sub.split(".")[0]}.</p>
            </div>
            <div>
              <b>Pages</b>
              {c.nav.map((n) => (live ? <a key={n} href={goTo(n)}>{n}</a> : <span key={n}>{n}</span>))}
            </div>
            <div>
              <b>Contact</b>
              {c.brand.email ? <span>{c.brand.email}</span> : null}
              {c.brand.phone ? <span>{c.brand.phone}</span> : null}
              {!c.brand.email && !c.brand.phone ? <span>{c.hero.cta}</span> : null}
            </div>
          </div>
          <div className="tpl-foot__bar">
            <span>© 2026 {c.brand.name}</span>
            {live ? <a href="https://app.wintechstudio.com">Made with Wintech Templates</a> : <span>Made with Wintech Templates</span>}
          </div>
        </div>
      </footer>
    </div>
  );
}

function Head({ title, at }: { title: string; at?: Record<string, string> }) {
  return title ? <h2 className="tpl-h2 tpl-head" {...at}>{title}</h2> : null;
}

/* ── What each kind lists ─────────────────────────────────────── */

const HUES = ["var(--h1)", "var(--h2)", "var(--h3)", "var(--h4)"];
function swatch(i: number): CSSProperties {
  const a = HUES[i % 4];
  const b = HUES[(i + 2) % 4];
  return { background: `linear-gradient(145deg, color-mix(in srgb, ${a} 78%, var(--t-bg)), color-mix(in srgb, ${b} 55%, var(--t-bg)))` };
}

function Picture({ item, i, art, wide, pic = () => ({}) }: { item: SiteItem; i: number; art: Art; wide?: boolean; pic?: Tag }) {
  return (
    <div className={`tpl-swatch ${wide ? "tpl-swatch--wide" : ""}`} style={item.image ? undefined : swatch(i)} {...pic(`items.list.${i}.image`)}>
      {item.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.image} alt="" />
      ) : art === "code" ? (
        <div className="m-code">{[70, 44, 60, 30].map((w, k) => <span key={k} style={{ width: `${w - i * 4}%` }} />)}</div>
      ) : art === "frames" ? (
        <span className="m-photo" />
      ) : art === "editorial" ? (
        <span className="p-garment" data-i={i % 2} />
      ) : art === "plates" ? (
        <span className="p-plate"><i /></span>
      ) : art === "bottles" ? (
        <span className="p-bottle" data-i={i % 3}><i /></span>
      ) : (
        <span className="m-screen"><i /><i /><i /></span>
      )}
    </div>
  );
}

function Items({
  template, items, live, reach, slug, at = () => ({}), pic = () => ({}),
}: {
  template: TemplateDef; items: SiteItem[]; live: boolean; reach: string; slug?: string;
  at?: Tag;
  pic?: Tag;
}) {
  const art = template.site.art;

  if (template.kind === "portfolio") {
    return (
      <div className="tpl-projects">
        {items.map((it, i) => (
          <article key={i} className="tpl-card tpl-project">
            <Picture item={it} i={i} art={art} wide pic={pic} />
            <div className="tpl-project__row"><b {...at(`items.list.${i}.title`)}>{it.title}</b><span aria-hidden="true">↗</span></div>
            <span {...at(`items.list.${i}.meta`)}>{it.meta}</span>
          </article>
        ))}
      </div>
    );
  }

  if (template.kind === "store") {
    const categories = Array.from(new Set(items.map((it) => (it.category || "").trim()).filter(Boolean)));
    return (
      <div className="tpl-catalogue-wrap">
        <CategoryBar categories={categories} />
        <div className="tpl-products" data-catalogue="">
          {items.map((it, i) => {
            const out = it.stock === 0;
            const low = typeof it.stock === "number" && it.stock > 0 && it.stock <= 3;
            return (
              <article key={i} className={`tpl-card tpl-product${out ? " is-out" : ""}`} data-category={(it.category || "").trim()}>
                <Picture item={it} i={i} art={art} pic={pic} />
                {out ? <span className="tpl-flag">Sold out</span> : low ? <span className="tpl-flag tpl-flag--low">Only {it.stock} left</span> : null}
                <div className="tpl-product__row"><b {...at(`items.list.${i}.title`)}>{it.title}</b><span {...at(`items.list.${i}.price`)}>{it.price}</span></div>
                {slug ? (
                  <BuyButton slug={slug} item={it} live={live} soldOut={out} label="Add to bag" className="tpl-btn--sm tpl-btn--block" />
                ) : (
                  <Btn live={live} href={reach} className="tpl-btn--sm tpl-btn--block">Add to bag</Btn>
                )}
              </article>
            );
          })}
        </div>
      </div>
    );
  }

  if (template.kind === "booking" && template.engine === "reservation") {
    return (
      <div className="tpl-card tpl-menu">
        {items.map((it, i) => (
          <div key={i} className="tpl-menu__row">
            <span {...at(`items.list.${i}.title`)}>{it.title}</span>
            <i aria-hidden="true" />
            <b {...at(`items.list.${i}.price`)}>{it.price}</b>
          </div>
        ))}
      </div>
    );
  }

  if (template.kind === "booking") {
    return (
      <div className="tpl-services">
        {items.map((it, i) => (
          <article key={i} className="tpl-card tpl-service">
            <div>
              <b {...at(`items.list.${i}.title`)}>{it.title}</b>
              <span {...at(`items.list.${i}.meta`)}>{it.meta}</span>
            </div>
            <div className="tpl-service__end">
              <em {...at(`items.list.${i}.price`)}>{it.price}</em>
              {slug ? (
                <BuyButton slug={slug} item={it} live={live} label="Book" className="tpl-btn--sm" />
              ) : (
                <Btn live={live} href={reach} className="tpl-btn--sm">Book</Btn>
              )}
            </div>
          </article>
        ))}
      </div>
    );
  }

  return (
    <div className="tpl-features">
      {items.map((it, i) => (
        <article key={i} className="tpl-card tpl-feature">
          <span className="tpl-feature__n">0{i + 1}</span>
          <b {...at(`items.list.${i}.title`)}>{it.title}</b>
          <p {...at(`items.list.${i}.meta`)}>{it.meta}</p>
        </article>
      ))}
    </div>
  );
}

function ReserveBar() {
  return (
    <div className="tpl-reserve">
      <span><small>Date</small>Fri 14 Nov</span>
      <span><small>Time</small>8:00 pm</span>
      <span><small>Guests</small>4</span>
      <span className="tpl-btn tpl-btn--sm">Reserve</span>
    </div>
  );
}

/* ── Artwork ──────────────────────────────────────────────────── */

function ArtPanel({ art, template }: { art: Art; template: TemplateDef }) {
  return (
    <div className={`tpl-art tpl-art--${art}`} aria-hidden="true">
      <ArtBody art={art} template={template} />
    </div>
  );
}

function ArtBody({ art, template }: { art: Art; template: TemplateDef }) {
  switch (art) {
    case "shapes":
      return (<><span className="a-circle" /><span className="a-square" /><span className="a-half" /><span className="a-bar" /><span className="a-chip">Case study</span></>);
    case "code":
      return (
        <div className="a-window">
          <div className="a-window__bar"><i /><i /><i /></div>
          {[62, 40, 78, 54, 30, 70, 46, 84, 36].map((w, i) => (
            <span key={i} className="a-line" style={{ width: `${w}%`, marginLeft: `${[0, 6, 6, 12, 12, 6, 12, 6, 0][i]}%`, background: HUES[i % 4] }} />
          ))}
          <span className="a-cursor" />
        </div>
      );
    case "frames":
      return (<><span className="a-frame a-frame--1"><i /></span><span className="a-frame a-frame--2"><i /></span><span className="a-frame a-frame--3"><i /></span></>);
    case "orbs":
      return (
        <>
          <span className="a-orb a-orb--1" /><span className="a-orb a-orb--2" /><span className="a-orb a-orb--3" />
          <div className="a-track">
            <p><b>Order #4821</b><span>Out for delivery</span></p>
            <div className="a-track__bar"><i /></div>
            <p><span>Yaba</span><span>Lekki · 34 min</span></p>
          </div>
        </>
      );
    case "ticket":
      return (
        <div className="a-ticket">
          <div className="a-ticket__main"><small>{template.site.brand}</small><b>14–15</b><b>NOV</b><span>Landmark Centre · VI</span></div>
          <div className="a-ticket__stub"><span>ADMIT ONE</span></div>
        </div>
      );
    case "phone":
      return (
        <>
          <span className="a-orb a-orb--1" /><span className="a-orb a-orb--2" />
          <div className="a-phone">
            <p className="a-phone__h">Flat 3B · December</p>
            <p className="a-phone__big">₦1,200,000</p>
            {[["You", "Paid"], ["Tolu", "Paid"], ["Emeka", "Due Fri"]].map(([n, st]) => (
              <p key={n} className="a-phone__row"><span>{n}</span><em data-due={st !== "Paid"}>{st}</em></p>
            ))}
            <span className="a-phone__btn">Remind Emeka</span>
          </div>
        </>
      );
    case "bottles":
      return (<><span className="a-plinth" /><span className="a-bottle a-bottle--tall"><i /></span><span className="a-bottle a-bottle--jar"><i /></span><span className="a-bottle a-bottle--tube"><i /></span></>);
    case "editorial":
      return (<><div className="a-panel a-panel--1"><span className="a-figure" /></div><div className="a-panel a-panel--2"><b>No. 04</b><span>Harmattan</span></div></>);
    case "plates":
      return (<><span className="a-plate a-plate--big"><i /><i /><i /></span><span className="a-plate a-plate--sm"><i /></span><span className="a-plate a-plate--xs"><i /></span></>);
    case "calendar":
      return (
        <div className="a-cal">
          <p className="a-cal__h"><b>November</b><span>Pick a day</span></p>
          <div className="a-cal__grid">
            {Array.from({ length: 28 }, (_, i) => <span key={i} data-on={i === 13} data-off={i % 7 === 0}>{i + 1}</span>)}
          </div>
          <div className="a-cal__slots">
            {["10:00", "11:30", "2:00", "4:30"].map((t, i) => <span key={t} data-on={i === 2}>{t}</span>)}
          </div>
        </div>
      );
  }
}
