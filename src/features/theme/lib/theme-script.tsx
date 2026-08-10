import "server-only";
import { THEME_STORAGE_KEY } from "@/shared/theme";

const script = `(function(){var d=document.documentElement;d.dataset.js="1";try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");d.dataset.theme=t==="light"?"light":"dark"}catch(e){d.dataset.theme="dark"}})()`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
