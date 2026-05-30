export function slugify(input: string, fallback = "post") {
  const slug = input
    .trim()
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);

  return slug || `${fallback}-${Date.now().toString(36)}`;
}
