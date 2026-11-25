import json
import os
import smtplib
import ssl
from datetime import datetime
from email.message import EmailMessage
from html import escape
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent
MAIL_TO = "ivanoyarzo15@gmail.com"
SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 587


def load_env():
    env_path = ROOT / ".env"
    if not env_path.exists():
        return
    for raw in env_path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


def smtp_config():
    load_env()
    user = os.environ.get("SMTP_USER", MAIL_TO).strip()
    password = os.environ.get("SMTP_PASS", "").replace(" ", "")
    destination = os.environ.get("MAIL_TO", MAIL_TO).strip()
    return user, password, destination


def formal_email(data):
    nombre = escape(data.get("nombre", "").strip())
    empresa = escape(data.get("empresa", "").strip())
    correo = escape(data.get("email", "").strip())
    interes = escape(data.get("interes", "").strip())
    mensaje = escape(data.get("mensaje", "").strip()) or "Sin detalle adicional."
    ahora = datetime.now().astimezone().strftime("%d/%m/%Y %H:%M")

    text = (
        "Solicitud de cotización — ENJAMARINE\n\n"
        f"Fecha: {ahora}\n"
        f"Nombre: {data.get('nombre', '').strip()}\n"
        f"Empresa o centro: {data.get('empresa', '').strip()}\n"
        f"Correo: {data.get('email', '').strip()}\n"
        f"Servicio: {data.get('interes', '').strip()}\n\n"
        "Mensaje:\n"
        f"{data.get('mensaje', '').strip() or 'Sin detalle adicional.'}\n\n"
        "Este mensaje fue enviado desde el formulario de contacto de Enjamarine.\n"
        "Puede responder a este correo para contactar al solicitante."
    )

    html = f"""
    <div style="margin:0;padding:0;background:#eef4f7;font-family:Arial,Helvetica,sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eef4f7;padding:28px 12px;">
        <tr>
          <td align="center">
            <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #d7e3ea;">
              <tr>
                <td style="background:#08263d;padding:22px 28px;color:#8ee0ee;font-size:12px;letter-spacing:.16em;text-transform:uppercase;font-weight:700;">
                  ENJAMARINE · Solicitud de cotización
                </td>
              </tr>
              <tr>
                <td style="padding:28px;">
                  <p style="margin:0 0 8px;color:#5b717a;font-size:13px;">{ahora}</p>
                  <h1 style="margin:0 0 16px;color:#08263d;font-size:22px;line-height:1.25;">Nueva solicitud de personal</h1>
                  <p style="margin:0 0 22px;color:#10212b;font-size:15px;line-height:1.55;">
                    Se recibió una solicitud a través del sitio web. Puede responder este mensaje para contactar al solicitante.
                  </p>
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #d7e3ea;border-radius:14px;">
                    <tr>
                      <td style="padding:14px 18px;border-bottom:1px solid #e7eef1;color:#5b717a;font-size:12px;letter-spacing:.08em;text-transform:uppercase;width:38%;">Nombre</td>
                      <td style="padding:14px 18px;border-bottom:1px solid #e7eef1;color:#08263d;font-weight:700;">{nombre}</td>
                    </tr>
                    <tr>
                      <td style="padding:14px 18px;border-bottom:1px solid #e7eef1;color:#5b717a;font-size:12px;letter-spacing:.08em;text-transform:uppercase;">Empresa o centro</td>
                      <td style="padding:14px 18px;border-bottom:1px solid #e7eef1;color:#08263d;font-weight:700;">{empresa}</td>
                    </tr>
                    <tr>
                      <td style="padding:14px 18px;border-bottom:1px solid #e7eef1;color:#5b717a;font-size:12px;letter-spacing:.08em;text-transform:uppercase;">Correo</td>
                      <td style="padding:14px 18px;border-bottom:1px solid #e7eef1;color:#0b3a62;">{correo}</td>
                    </tr>
                    <tr>
                      <td style="padding:14px 18px;color:#5b717a;font-size:12px;letter-spacing:.08em;text-transform:uppercase;">Servicio</td>
                      <td style="padding:14px 18px;color:#08263d;font-weight:700;">{interes}</td>
                    </tr>
                  </table>
                  <p style="margin:22px 0 8px;color:#5b717a;font-size:12px;letter-spacing:.08em;text-transform:uppercase;">Mensaje</p>
                  <p style="margin:0;padding:16px 18px;background:#f7fbfc;border-radius:12px;color:#10212b;font-size:15px;line-height:1.6;white-space:pre-wrap;">{mensaje}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:16px 28px 22px;color:#5b717a;font-size:12px;border-top:1px solid #e7eef1;">
                  Inversiones Enjamarine SpA · Puerto Montt
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
    """
    return text, html, ahora, data.get("empresa", "").strip(), data.get("email", "").strip()


def send_mail(data):
    user, password, destination = smtp_config()
    if not password:
        raise RuntimeError("missing-smtp")
    text, html, _, empresa, reply_to = formal_email(data)
    subject = "Solicitud de cotización"
    if empresa:
        subject += f" · {empresa}"
    subject += " · ENJAMARINE"

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = f"ENJAMARINE <{user}>"
    msg["To"] = destination
    if reply_to:
        msg["Reply-To"] = reply_to
    msg.set_content(text)
    msg.add_alternative(html, subtype="html")

    context = ssl.create_default_context()
    with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=18) as smtp:
        smtp.starttls(context=context)
        smtp.login(user, password)
        smtp.send_message(msg)


class SiteHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        origin = self.headers.get("Origin", "")
        if origin.startswith("http://127.0.0.1") or origin.startswith("http://localhost"):
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def do_POST(self):
        path = urlparse(self.path).path.rstrip("/")
        if path != "/api/cotizar":
            self.send_error(404)
            return
        length = int(self.headers.get("Content-Length", "0") or 0)
        raw = self.rfile.read(length) if length else b"{}"
        try:
            data = json.loads(raw.decode("utf-8"))
        except json.JSONDecodeError:
            self._json(400, {"ok": False, "error": "invalid"})
            return
        if data.get("_honey"):
            self._json(200, {"ok": True})
            return
        required = ("nombre", "empresa", "email", "interes")
        if any(not str(data.get(key, "")).strip() for key in required):
            self._json(400, {"ok": False, "error": "incomplete"})
            return
        try:
            send_mail(data)
        except RuntimeError as error:
            if str(error) == "missing-smtp":
                self._json(503, {"ok": False, "error": "smtp"})
                return
            self._json(500, {"ok": False, "error": "send"})
            return
        except Exception:
            self._json(500, {"ok": False, "error": "send"})
            return
        self._json(200, {"ok": True})

    def _json(self, status, payload):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format, *args):
        print("[%s] %s" % (self.log_date_time_string(), format % args))


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "5500"))
    server = ThreadingHTTPServer(("127.0.0.1", port), SiteHandler)
    print(f"ENJAMARINE en http://127.0.0.1:{port}")
    server.serve_forever()
