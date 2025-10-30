(function () {
  // https://dashboard.emailjs.com/admin/integration
  emailjs.init("3dpw3MyafCpWF6vYj");
})();

window.onload = function () {
  document
    .getElementById("contact-form")
    .addEventListener("submit", function (event) {
      event.preventDefault();
      // these IDs from the previous steps
      emailjs.sendForm("service_zxe3f0t", "template_gil3jip", this).then(
        function () {
          console.log("SUCCESS!");
          document.getElementById("contact-form").reset();
        },
        function (error) {
          console.log("FAILED...", error);
          alert("Failed to send message. Please try again later.");
        }
      );
    });
};
