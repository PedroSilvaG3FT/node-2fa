const fs = require("fs");
const util = require("util");
const path = require("path");
const qrcode = require("qrcode");
const express = require("express");
const speakeasy = require("speakeasy");
const parseUrl = require("body-parser");

const app = express();
const readFileAsync = util.promisify(fs.readFile);
let encodeUrl = parseUrl.urlencoded({ extended: false });

app.get("/", (req, res) => {
  readFileAsync(path.join(__dirname, "form.html"), "utf8").then((html) => {
    const secret = speakeasy.generateSecret({ name: "Bauk-2FA" });
    qrcode.toDataURL(secret.otpauth_url, (err, data) => {
      html = html.replace("{{qrcode}}", data);
      html = html.replace("{{qrcodeURL}}", data);
      html = html.replace("{{secret}}", secret.ascii);
      html = html.replace("{{secret}}", secret.ascii);
      html = html.replace("{{result_container}}", "");

      res.send(html);
    });
  });
});

app.post("/", encodeUrl, (req, res) => {
  readFileAsync(path.join(__dirname, "form.html"), "utf8").then((html) => {
    const { qrcodeURL, secret, token } = req.body;
    const verified = speakeasy.totp.verify({
      token,
      secret,
      encoding: "ascii",
    });

    const success = `<div class="alert alert-primary" role="alert">Validado</div>`;
    const error = `<div class="alert alert-danger" role="alert">Código inválido</div>`;
    const container = verified ? success : error;

    html = html.replace("{{secret}}", secret);
    html = html.replace("{{qrcode}}", qrcodeURL);
    html = html.replace("{{qrcodeURL}}", qrcodeURL);
    html = html.replace("{{result_container}}", container);

    res.send(html);
  });
});

app.listen(3000);
