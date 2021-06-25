const router = require("express").Router();
const methodNotAllowed = require("../errors/methodNotAllowed")
const ordersController = require("./orders.controller")

// TODO: Implement the /orders routes needed to make the tests pass

router
.route("/")
.get(ordersController.list)
.post(ordersController.create)
.all(methodNotAllowed);

router
.route("/:orderId")
.get(ordersController.read)
.put(ordersController.update)
.delete(ordersController.destroy)
.all(methodNotAllowed);

module.exports = router;