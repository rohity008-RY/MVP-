import { cookies } from "next/headers";

export const accessCookie = "bs_admin_access";
export const refreshCookie = "bs_admin_refresh";

export async function getAdminAccessToken() {
  return (await cookies()).get(accessCookie)?.value;
}

export async function hasAdminSession() {
  return Boolean(await getAdminAccessToken());
}
