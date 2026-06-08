#!/usr/bin/env python3
# Dev server bez cache (no-store) — prohlížeč vždy načte aktuální kód.
# Spuštění: python3 serve.py [port]
import http.server, functools, sys, os

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8743
DIR = os.path.dirname(os.path.abspath(__file__))


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()


handler = functools.partial(NoCacheHandler, directory=DIR)
print(f"Serving {DIR} on http://localhost:{PORT}/ (no-cache)")
http.server.ThreadingHTTPServer(('', PORT), handler).serve_forever()
