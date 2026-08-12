import { notFound } from "next/navigation";

/**
 * Ловушка под несуществующие адреса. Без неё `/ru/чего-нибудь` не совпадает ни
 * с одним сегментом, `[locale]/layout.tsx` не отрисовывается вовсе, и Next
 * отдаёт свою служебную страницу — без шапки, подвала, темы и перевода.
 */
export default function Page() {
  notFound();
}
