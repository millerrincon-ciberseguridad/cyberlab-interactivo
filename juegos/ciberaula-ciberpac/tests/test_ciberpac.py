#!/usr/bin/env python3
"""Functional smoke tests for the static CiberPAC package."""
from __future__ import annotations

import contextlib
import http.server
import socket
import threading
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass


def free_port() -> int:
    with contextlib.closing(socket.socket()) as sock:
        sock.bind(("127.0.0.1", 0))
        return int(sock.getsockname()[1])


def run() -> None:
    port = free_port()
    handler = lambda *args, **kwargs: QuietHandler(*args, directory=str(ROOT), **kwargs)
    server = http.server.ThreadingHTTPServer(("127.0.0.1", port), handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    errors: list[str] = []

    try:
        with sync_playwright() as pw:
            candidates = sorted(Path("/opt/pw-browsers").glob("chromium-*/chrome-linux64/chrome"))
            executable = candidates[-1] if candidates else None
            browser = pw.chromium.launch(headless=True, executable_path=str(executable) if executable else None)
            page = browser.new_page(viewport={"width": 390, "height": 844}, device_scale_factor=1)
            page.on("console", lambda msg: errors.append(msg.text) if msg.type == "error" else None)
            page.on("pageerror", lambda exc: errors.append(str(exc)))
            page.goto(f"http://127.0.0.1:{port}/", wait_until="networkidle")

            assert page.locator("body").evaluate("e => getComputedStyle(e, '::before').backgroundImage.includes('anonymous-fondo.webp')")
            assert page.locator("#boardWrap").bounding_box()["width"] <= 333
            assert page.evaluate("document.documentElement.scrollWidth <= innerWidth + 1")
            assert page.locator("#threatLegend .legend-item").count() == 6
            assert page.locator("#defenseLegend .legend-item").count() == 6

            page.fill("#nameInput", "Prueba móvil")
            page.click("#startButton")
            page.wait_for_timeout(2400)
            snapshot = page.evaluate("window.__CIBERPAC_TEST__.getSnapshot()")
            assert snapshot["pellets"] > 100
            assert len(snapshot["ghosts"]) == 6
            assert any(g["status"] == "active" for g in snapshot["ghosts"])
            assert any((g["r"], g["c"]) not in {(9, 8), (9, 7), (9, 9), (8, 8), (10, 7), (10, 9)} for g in snapshot["ghosts"])

            eaten = page.evaluate("window.__CIBERPAC_TEST__.forceEat(0)")
            assert eaten["name"] == "PHISHING"
            assert eaten["status"] == "returning"
            assert eaten["routeLength"] > 0
            page.wait_for_timeout(180)
            page.screenshot(path=str(ROOT / "tests" / "mobile-return-label.png"), full_page=True)

            page.set_viewport_size({"width": 1366, "height": 900})
            page.wait_for_timeout(150)
            assert page.evaluate("document.documentElement.scrollWidth <= innerWidth + 1")
            page.screenshot(path=str(ROOT / "tests" / "desktop-game.png"), full_page=True)

            resources = page.evaluate("performance.getEntriesByType('resource').map(x => x.name)")
            assert any("anonymous-fondo.webp" in item for item in resources)
            browser.close()
    finally:
        server.shutdown()
        thread.join(timeout=2)

    assert not errors, f"Browser errors: {errors}"
    print("OK: background, mobile fit, ghost movement, return label, assets and console verified")


if __name__ == "__main__":
    run()
