function doPost(e) {
  try {
    var data = {};
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = {};
      }
    }
    if (!data.html && e && e.parameter) {
      data.subject = data.subject || e.parameter.subject;
      data.html = data.html || e.parameter.html;
    }
    if (!data.html) {
      throw new Error("Falta el cuerpo del mensaje");
    }
    MailApp.sendEmail({
      to: "contacto@enjamarine.com",
      subject: data.subject || "Nueva solicitud de cotización · ENJAMARINE.CL",
      htmlBody: data.html,
      name: "ENJAMARINE.CL",
    });
    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput("ok");
}
