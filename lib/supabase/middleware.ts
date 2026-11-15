import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { ROOT_DOMAIN } from "../config";
import { tenantSlugFromHost } from "../slugs";

export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const host = request.headers.get("host") || "";
  const slug = tenantSlugFromHost(host, ROOT_DOMAIN);
  const path = request.nextUrl.pathname;

  // The preview screens exist so the design can be checked without an
  // account. The page components refuse to render in production, but a
  // rendered refusal still answers 200 once the response has started
  // streaming, so the route is closed here instead, before rendering.
  if (process.env.NODE_ENV === "production" && path.startsWith("/dev")) {
    return new NextResponse(null, { status: 404 });
  }

  // A customer's public site. Nobody signs in on these, so skip Supabase
  // entirely. Doing the auth check here cost one Supabase auth call per
  // visitor per page across every site on the platform, for nothing.
  //
  // Every path is pinned to this host's own slug, /view/* included, so
  // bestluxury.wintechstudio.com/view/someone-else cannot show another
  // site's content under bestluxury's name.
  if (slug) {
    if (path.startsWith("/_next")) return NextResponse.next({ request });
    const rewrite = request.nextUrl.clone();
    rewrite.pathname = `/view/${slug}`;
    return NextResponse.rewrite(rewrite);
  }

  let response = NextResponse.next({ request });

  if (!url || !key) {
    return response;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthPage = path.startsWith("/login") || path.startsWith("/signup");
  const isDashboard = path.startsWith("/dashboard");

  if (!user && isDashboard) {
    const login = request.nextUrl.clone();
    login.pathname = "/login";
    // Bring them back to the page they asked for, not to the dashboard home.
    login.search = "";
    login.searchParams.set("next", path + request.nextUrl.search);
    return NextResponse.redirect(login);
  }

  if (user && isAuthPage) {
    const dash = request.nextUrl.clone();
    dash.pathname = "/dashboard";
    return NextResponse.redirect(dash);
  }

  return response;
}
