import { createHighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import darkPlus from "@shikijs/themes/dark-plus";
import bash from "@shikijs/langs/bash";
import c from "@shikijs/langs/c";
import cpp from "@shikijs/langs/cpp";
import diff from "@shikijs/langs/diff";
import json from "@shikijs/langs/json";
import markdown from "@shikijs/langs/markdown";
import rust from "@shikijs/langs/rust";
import sh from "@shikijs/langs/sh";
import shellscript from "@shikijs/langs/shellscript";
import toml from "@shikijs/langs/toml";
import yaml from "@shikijs/langs/yaml";
import yml from "@shikijs/langs/yml";
import zsh from "@shikijs/langs/zsh";

const THEME_NAME = "blog-dark-plus";
const COMMENT_COLOR = "#8F9AC9";
const blogDarkPlus = {
  ...darkPlus,
  name: THEME_NAME,
  tokenColors: darkPlus.tokenColors.map((token) => {
    if (token.settings?.foreground?.toUpperCase() !== "#6A9955") {
      return token;
    }

    return {
      ...token,
      settings: {
        ...token.settings,
        foreground: COMMENT_COLOR,
      },
    };
  }),
};

const LANGUAGE_MODULES = new Map([
  ["bash", bash],
  ["c", c],
  ["cpp", cpp],
  ["diff", diff],
  ["json", json],
  ["markdown", markdown],
  ["md", markdown],
  ["rust", rust],
  ["rs", rust],
  ["sh", sh],
  ["shell", shellscript],
  ["shellscript", shellscript],
  ["toml", toml],
  ["yaml", yaml],
  ["yml", yml],
  ["zsh", zsh],
]);

const highlighterPromise = createHighlighterCore({
  engine: createJavaScriptRegexEngine(),
  themes: [blogDarkPlus],
  langs: [...new Set([...LANGUAGE_MODULES.values()].flat())],
});

const createTitle = (block, lang, content) => {
  if (block.querySelector(":scope > .code-title") !== null) {
    return;
  }

  const title = document.createElement("div");
  title.classList.add("code-title");
  title.innerText = lang;

  if (navigator.clipboard !== undefined) {
    const cpbutton = document.createElement("button");
    cpbutton.classList.add("copy-button");
    cpbutton.innerText = "Copy";

    cpbutton.addEventListener("click", () => {
      cpbutton.innerText = "Copied";
      setTimeout(() => {
        cpbutton.innerText = "Copy";
      }, 1000);

      navigator.clipboard.writeText(content);
    });

    title.append(cpbutton);
  }

  block.prepend(title);
};

const highlightBlock = async (block, highlighter) => {
  const code = block.querySelector("code[data-lang]");
  const body = block.querySelector(".highlight__body");

  if (code === null || body === null) {
    return;
  }

  const source = code.textContent ?? "";
  const originalLang = (code.dataset.lang ?? block.dataset.lang ?? "text").toLowerCase();
  const displayLang = code.dataset.lang ?? block.dataset.lang ?? "text";
  const lang = LANGUAGE_MODULES.has(originalLang) ? originalLang : null;

  createTitle(block, displayLang, source);

  if (lang === null) {
    block.dataset.shiki = "skipped";
    return;
  }

  try {
    const html = highlighter.codeToHtml(source, {
      lang,
      theme: THEME_NAME,
    });

    body.innerHTML = html;
    body.querySelector("pre.shiki")?.setAttribute("data-lang", displayLang);
    block.dataset.shiki = "ready";
  } catch (error) {
    console.error("Failed to highlight code block with Shiki.", error);
    block.dataset.shiki = "error";
  }
};

const renderCodeBlocks = async () => {
  const blocks = [...document.querySelectorAll(".code-block")];

  if (blocks.length === 0) {
    return;
  }

  const highlighter = await highlighterPromise;
  await Promise.all(blocks.map((block) => highlightBlock(block, highlighter)));
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    void renderCodeBlocks();
  });
} else {
  void renderCodeBlocks();
}
