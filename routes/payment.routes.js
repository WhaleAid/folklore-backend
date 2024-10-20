module.exports = (app) => {
    const paymentController = require("../controllers/payment.controller.js");

    app.post("/payment", paymentController.createPayment);
    app.get("/payment/:id", paymentController.getPayment);
    app.get("/payment", paymentController.getAllPayments);
    app.post("/check-password", paymentController.checkPassword);
}