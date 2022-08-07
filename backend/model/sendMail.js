var mail = require("nodemailer");

var smtpTransport = mail.createTransport({
  service: "gmail",
  auth: {
    user: "admin@medialab.com",
    pass: "AdminPassword",
  },
});

exports.sendMail = function (email, subject, message) {
  return new Promise(function (resolve, reject) {
    var mailOptions = {
      from: "MediaLab <admin@medialab.com>",
      to: email,
      subject: subject,
      html: message,
    };
    smtpTransport.sendMail(mailOptions, function (err, result) {
      console.log(err);
      if (err) {
        reject(false);
      } else {
        resolve(result);
      }
    });
  })
    .catch((err) => {
      return false;
    })
    .then((res) => res);
};
