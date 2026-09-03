import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // 1. Detectar país mediante Vercel Geolocation headers o request.geo
  const geoCountry =
    request.headers.get("x-vercel-ip-country") ||
    (request as any).geo?.country ||
    "US";

  const upperCountry = geoCountry.toUpperCase();

  // 2. Establecer cookie `user-country` si aún no existe
  const existingCountryCookie = request.cookies.get("user-country")?.value;

  if (!existingCountryCookie) {
    // Si el país es Perú ('PE'), asignar PE. De lo contrario 'US'
    const defaultCountry = upperCountry === "PE" ? "PE" : "US";
    response.cookies.set("user-country", defaultCountry, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 días
      sameSite: "lax",
    });
  }

  // 3. Asignar moneda por defecto ('PEN' para PE, 'USD' para el resto) si no hay preferencia manual
  const existingCurrencyCookie = request.cookies.get("user-currency")?.value;
  if (!existingCurrencyCookie) {
    const defaultCurrency = (existingCountryCookie || upperCountry) === "PE" ? "PEN" : "USD";
    response.cookies.set("user-currency", defaultCurrency, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Interceptar todas las solicitudes excepto recursos estáticos (_next, imágenes, favicon)
     */
    "/((?!_next/static|_next/image|favicon.ico|assets).*)",
  ],
};
