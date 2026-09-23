"""Render maintainable GitHub/project records into crawler-readable static HTML.

Run: python3 scripts/render_catalog.py
CI / validation: python3 scripts/render_catalog.py --check
The website requires no Python, framework, or data fetch in the visitor's browser.
"""
import argparse
import html
import json
import re
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]


def esc(value):
    return html.escape(str(value), quote=True)


def valid_url(value):
    if not isinstance(value, str) or not value:
        raise ValueError("Links must be nonempty strings.")
    if value.startswith("#"):
        if not re.fullmatch(r"#[a-z][a-z0-9-]*", value):
            raise ValueError("Invalid internal link.")
        return value
    parsed = urlparse(value)
    if parsed.scheme != "https" or not parsed.hostname or parsed.username or parsed.password:
        raise ValueError("External destinations must use HTTPS without credentials.")
    return value


def link(item, *, button=False):
    url = valid_url(item["url"])
    external = ' target="_blank" rel="noopener noreferrer"' if not url.startswith("#") else ""
    style = "btn primary" if item.get("primary") else ("btn ghost" if button else "text-link")
    return f'<a class="{style}" href="{esc(url)}"{external}>{esc(item["label"])} <span aria-hidden="true">↗</span></a>'


def tags(items):
    return '<ul class="tech-tags" aria-label="Technologies">' + "".join(f"<li>{esc(t)}</li>" for t in items) + "</ul>"


def repo_preview(kind):
    previews = {
        "publication": '''<div class="repo-preview repo-preview-publication" aria-hidden="true">
          <span class="preview-topbar"><i></i><i></i><i></i></span>
          <div class="preview-publication-layout"><span class="preview-kicker"></span><span class="preview-headline"></span><span class="preview-headline short"></span><div class="preview-story-row"><i></i><i></i><i></i></div></div>
        </div>''',
        "document": '''<div class="repo-preview repo-preview-document" aria-hidden="true">
          <span class="preview-topbar"><i></i><i></i><i></i></span>
          <div class="preview-document-sheet"><span class="preview-doc-icon">PDF</span><span class="preview-doc-line"></span><span class="preview-doc-line short"></span><div class="preview-checks"><i></i><i></i><i></i></div></div>
        </div>''',
        "analytics": '''<div class="repo-preview repo-preview-analytics" aria-hidden="true">
          <span class="preview-topbar"><i></i><i></i><i></i></span>
          <div class="preview-analytics-layout"><div class="preview-metrics"><i></i><i></i><i></i></div><div class="preview-chart"><i></i><i></i><i></i><i></i><i></i></div><span class="preview-verdict"></span></div>
        </div>''',
    }
    if kind not in previews:
        raise ValueError("Unknown GitHub preview type.")
    return previews[kind]


def render_github(data):
    profile_url = valid_url(data["profile_url"])
    profile_tags = "".join(f"<span>{esc(item)}</span>" for item in data["tags"])
    repo_cards = []
    for repo in data["repos"]:
        github_url = valid_url(repo["github_url"])
        live_url = repo.get("live_url")
        live_link = ""
        if live_url:
            live_url = valid_url(live_url)
            live_link = f'<a class="text-link" href="{esc(live_url)}" target="_blank" rel="noopener noreferrer">Open app <span aria-hidden="true">↗</span></a>'
        repo_cards.append(
            f'''<article class="github-repo-card fade-in-up" id="{esc(repo["id"])}">
          {repo_preview(repo["preview"])}
          <div class="github-repo-copy">
            <div class="github-repo-meta"><span>{esc(repo["category"])}</span><span class="repo-status">{esc(repo["status"])}</span></div>
            <h3>{esc(repo["name"])}</h3>
            <p>{esc(repo["description"])}</p>
            {tags(repo["tags"])}
            <div class="github-repo-links"><a class="text-link" href="{esc(github_url)}" target="_blank" rel="noopener noreferrer">View repository <span aria-hidden="true">↗</span></a>{live_link}</div>
          </div>
        </article>'''
        )
    return f'''
        <div class="github-showcase">
          <article class="github-profile-card fade-in-up">
            <div class="github-profile-top">
              <span class="github-avatar" aria-hidden="true">&lt;/&gt;</span>
              <div><p class="label">github.com/{esc(data["handle"])}</p><h3>@{esc(data["handle"])}</h3></div>
              <span class="github-public-badge"><i aria-hidden="true"></i> Public work</span>
            </div>
            <p class="github-profile-copy">{esc(data["description"])}</p>
            <div class="github-profile-tags" aria-label="GitHub focus areas">{profile_tags}</div>
            <a class="btn primary" href="{esc(profile_url)}" target="_blank" rel="noopener noreferrer">Explore GitHub <span aria-hidden="true">↗</span></a>
          </article>
          <div class="github-repo-grid">
            {"".join(repo_cards)}
          </div>
        </div>
        '''


def render_work(item):
    links = ""
    if item.get("links"):
        links = '<div class="work-links">' + "".join(link(entry) for entry in item["links"]) + "</div>"

    if item["layout"] == "project":
        status = f'<span class="project-status">{esc(item["status"])}</span>' if item.get("status") else ""
        return f'''<article class="work-card work-project fade-in-up" id="{esc(item["id"])}">
        <div class="work-project-top"><p class="label">{esc(item["category"])}</p>{status}</div>
        <div class="work-copy"><h3>{esc(item["name"])}</h3><p>{esc(item["description"])}</p>{tags(item["tags"])}</div>
        {links}
      </article>'''

    if item["layout"] == "reference":
        return f'''<article class="work-reference fade-in-up" id="{esc(item["id"])}"><div><p class="label">{esc(item["category"])}</p><h3>{esc(item["name"])}</h3></div><p>{esc(item["description"])}</p>{links}</article>'''

    title = f'<h3>{esc(item["name"])}</h3>'
    headline = f'<p class="work-headline">{esc(item["headline"])}</p>' if item.get("headline") else ""
    caps = "".join(f'<div><h4>{esc(cap["title"])}</h4><p>{esc(cap["text"])}</p></div>' for cap in item["capabilities"])
    supporting = item["layout"] == "supporting"
    trailing_links = f'\n        {links}' if supporting and links else ""
    return f'''<article class="work-card work-{esc(item["layout"])} fade-in-up" id="{esc(item["id"])}">
        <div class="work-copy"><p class="label">{esc(item["category"])}</p>{title}{headline}<p>{esc(item["description"])}</p>{tags(item["tags"])}{"" if supporting else links}</div>
        <div class="work-capabilities">{caps}</div>{trailing_links}
      </article>'''


def render():
    data = json.loads((ROOT / "content/catalog.json").read_text())
    github = data["github"]
    repos = github["repos"]
    work = data["work"]

    ids = [item["id"] for item in repos + work]
    if len(ids) != len(set(ids)) or any(not re.fullmatch(r"[a-z][a-z0-9-]*", item_id) for item_id in ids):
        raise ValueError("GitHub and work IDs must be unique lowercase slugs.")

    if any(item["layout"] not in ("featured", "supporting", "project", "reference") for item in work):
        raise ValueError("Unknown work layout.")

    valid_url(github["profile_url"])
    for repo in repos:
        valid_url(repo["github_url"])
        if repo.get("live_url"):
            valid_url(repo["live_url"])
        repo_preview(repo["preview"])

    blocks = {
        "github": render_github(github),
        "work": '\n        <div class="work-grid">\n' + "\n".join(render_work(item) for item in work) + "\n        </div>\n        ",
    }

    original = (ROOT / "index.html").read_text()
    output = original
    for name, block in blocks.items():
        start, end = f"<!-- catalog:{name}:start -->", f"<!-- catalog:{name}:end -->"
        if output.count(start) != 1 or output.count(end) != 1:
            raise ValueError(f"Expected one marker pair for {name}.")
        before, rest = output.split(start)
        _, after = rest.split(end)
        output = before + start + block + end + after
    return original, output


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    before, after = render()
    if args.check:
        if before != after:
            raise SystemExit("Catalog HTML is stale. Run python3 scripts/render_catalog.py.")
        print("GitHub and project content is current.")
    else:
        (ROOT / "index.html").write_text(after)
        print("Rendered GitHub and project content.")
