"""HTML pages: home, faucet, mempool, wallet, stats, study docs."""

from __future__ import annotations

import json as _json
from html import escape
from pathlib import Path

from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse, JSONResponse

from ..core import config, node
from ..templates import templates

router = APIRouter()


def _ctx(request: Request, lang: str | None, *, current_page: str | None = None, show_search: bool = False, **extra) -> dict:
    return {
        "title": config.APP_TITLE,
        "version": config.APP_VERSION,
        "lang": lang or config.DEFAULT_LANG,
        "current_page": current_page,
        "show_search": show_search,
        "display_url": config.DISPLAY_URL,
        "terminal_url": config.TERMINAL_URL,
        **extra,
    }


@router.get("/", response_class=HTMLResponse)
def home(request: Request, lang: str | None = None):
    return templates.TemplateResponse(
        request=request,
        name="home.html",
        context=_ctx(request, lang, current_page="home", summary=node.summary()),
    )


@router.get("/faucet", response_class=HTMLResponse)
def faucet_page(request: Request, lang: str | None = None):
    return templates.TemplateResponse(
        request=request,
        name="faucet.html",
        context=_ctx(
            request,
            lang,
            current_page="faucet",
            amount=str(config.FAUCET_AMOUNT_BTC),
            cooldown=config.FAUCET_COOLDOWN_SECONDS,
            turnstile_enabled=config.TURNSTILE_ENABLED,
            turnstile_site_key=config.TURNSTILE_SITE_KEY,
            faucet_wallet_name=config.FAUCET_WALLET_NAME,
            summary=node.summary(),
        ),
    )


@router.get("/mempool", response_class=HTMLResponse)
def mempool_page(request: Request, lang: str | None = None):
    return templates.TemplateResponse(
        request=request,
        name="mempool.html",
        context=_ctx(request, lang, current_page="mempool", summary=node.summary(), refresh_interval=config.REFRESH_MEMPOOL),
    )


@router.get("/wallet", response_class=HTMLResponse)
def wallet_page(request: Request, lang: str | None = None):
    return templates.TemplateResponse(
        request=request,
        name="wallet.html",
        context=_ctx(request, lang, current_page="wallet", faucet_wallet_name=config.FAUCET_WALLET_NAME),
    )


@router.get("/signing", response_class=HTMLResponse)
def signing_page(request: Request, lang: str | None = None):
    return templates.TemplateResponse(
        request=request,
        name="signing.html",
        context=_ctx(request, lang, current_page="signing"),
    )


@router.get("/stats", response_class=HTMLResponse)
def stats_page(request: Request, lang: str | None = None):
    return templates.TemplateResponse(
        request=request, name="stats.html", context=_ctx(request, lang, current_page="stats", refresh_interval=config.REFRESH_STATS)
    )


def _load_docs_manifest() -> list[dict]:
    """Load docs/manifest.json; returns [] if missing or invalid."""
    path = Path(config.DOCS_DIR) / "manifest.json"
    try:
        return _json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return []


def _title_from_filename(filename: str) -> str:
    return filename.replace(".md", "").replace("-", " ").replace("_", " ").title()


def _build_sections(manifest: list[dict]) -> list[dict]:
    """Build template-ready sections from the manifest."""
    sections = []
    for entry in manifest:
        section_key = entry.get("section", "")
        titles = entry.get("title", {})
        docs = []
        for doc in entry.get("docs", []):
            docs.append({
                "key": doc["key"],
                "section": section_key,
                "en_gb": doc.get("en-gb", ""),
                "pt_br": doc.get("pt-br", ""),
                "title_en": _title_from_filename(doc.get("en-gb", "")),
                "title_pt": _title_from_filename(doc.get("pt-br", "")),
            })
        sections.append({
            "key": section_key,
            "title_en": titles.get("en-gb", section_key.replace("-", " ").title()),
            "title_pt": titles.get("pt-br", section_key.replace("-", " ").title()),
            "docs": docs,
        })
    return sections


@router.get("/study-docs", response_class=HTMLResponse)
def docs_page(request: Request, lang: str | None = None):
    manifest = _load_docs_manifest()
    sections = _build_sections(manifest)
    return templates.TemplateResponse(
        request=request,
        name="docs.html",
        context=_ctx(request, lang, current_page="docs", sections=sections),
    )


def _find_doc_in_manifest(manifest: list[dict], key: str) -> tuple[dict | None, str]:
    """Find a doc entry and its section in the manifest. Returns (doc, section_key)."""
    for entry in manifest:
        section_key = entry.get("section", "")
        for doc in entry.get("docs", []):
            if doc["key"] == key:
                return doc, section_key
    return None, ""


@router.post("/api/docs/rebuild-manifest")
def rebuild_manifest():
    """Scan docs/ directory and regenerate manifest.json."""
    docs_root = Path(config.DOCS_DIR)
    skip = {"manifest.json", ".DS_Store", "__pycache__"}
    manifest: list[dict] = []

    for section_dir in sorted(docs_root.iterdir()):
        if not section_dir.is_dir() or section_dir.name in skip:
            continue
        section_key = section_dir.name
        locale_files: dict[str, list[str]] = {}
        for locale_dir in sorted(section_dir.iterdir()):
            if not locale_dir.is_dir() or locale_dir.name.startswith("."):
                continue
            locale = locale_dir.name
            locale_files[locale] = sorted(
                f.name for f in locale_dir.iterdir() if f.is_file() and f.suffix == ".md"
            )

        if not locale_files:
            continue

        ref_locale = "en-gb" if "en-gb" in locale_files else next(iter(locale_files))
        ref_files = locale_files[ref_locale]
        other_locales = {k: v for k, v in locale_files.items() if k != ref_locale}
        docs: list[dict] = []
        for idx, filename in enumerate(ref_files):
            entry: dict = {"key": filename.replace(".md", ""), ref_locale: filename}
            for loc, files in other_locales.items():
                if idx < len(files):
                    entry[loc] = files[idx]
            docs.append(entry)
        for loc, files in other_locales.items():
            for extra in files[len(ref_files):]:
                docs.append({"key": extra.replace(".md", ""), loc: extra})

        manifest.append({
            "section": section_key,
            "title": {
                "en-gb": section_key.replace("-", " ").title(),
                "pt-br": section_key.replace("-", " ").title(),
            },
            "docs": docs,
        })

    manifest_path = docs_root / "manifest.json"
    manifest_path.write_text(_json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return JSONResponse({"ok": True, "sections": len(manifest)})


@router.get("/api/docs/{locale}/{key}", response_class=HTMLResponse)
def docs_content(locale: str, key: str):
    """Return a rendered markdown document.

    Looks up the locale-specific filename from manifest.json.
    Fallback: requested locale → en-gb → any available locale.
    """
    import re as _re
    import markdown as _md

    safe_locale = _re.sub(r"[^a-z-]", "", locale.lower())[:8]
    safe_key = _re.sub(r"[^a-zA-Z0-9_-]", "", key)

    manifest = _load_docs_manifest()
    doc, section_key = _find_doc_in_manifest(manifest, safe_key)
    if not doc:
        return HTMLResponse("<p>Document not found.</p>", status_code=404)

    docs_root = Path(config.DOCS_DIR)
    base = docs_root / section_key if section_key else docs_root

    # Try requested locale, then en-gb, then any locale that has the file
    locales_to_try = [safe_locale, "en-gb"]
    all_locales = [k for k in doc if k != "key"]
    for loc in all_locales:
        if loc not in locales_to_try:
            locales_to_try.append(loc)

    for try_locale in locales_to_try:
        filename = doc.get(try_locale)
        if filename:
            path = base / try_locale / filename
            if path.is_file():
                break
    else:
        return HTMLResponse("<p>Document not found.</p>", status_code=404)

    raw = path.read_text(encoding="utf-8")
    html = _md.markdown(raw, extensions=["fenced_code", "tables", "toc"])
    return HTMLResponse(html)
