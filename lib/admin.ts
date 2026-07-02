export const ADMIN_EMAIL = "kristi.artan.braholli@gmail.com";

export function isAdminEmail(email?: string | null): boolean {
    const normalizedEmail = email?.trim().toLowerCase();
    return normalizedEmail === ADMIN_EMAIL.toLowerCase();
}
