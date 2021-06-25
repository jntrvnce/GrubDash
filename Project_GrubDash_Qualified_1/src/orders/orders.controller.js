const { type } = require("os");
const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

function orderExists(req, res, next) {
    const { orderId } = req.params;
    res.locals.orderId = orderId;
    const foundOrder = orders.find((order) => order.id === orderId);
    if (foundOrder) {
        res.locals.foundOrder = foundOrder;
        return next();
    }
    return next({
        status: 404,
        message: `Order id not found: ${orderId}`
    })
}

function hasDeliverTo(req, res, next) {
    if (!req.body.data.deliverTo) {
        return next({
            status: 400,
            message: "Order must include a deliverTo"
        })
    }
    return next();
}

function hasMobileNumber(req, res, next) {
    if (!req.body.data.mobileNumber) {
        return next({
            status: 400,
            message: "Order must include a mobileNumber"
        })
    }
    return next();
}

function hasDishes(req, res, next) {
    if (!req.body.data.dishes) {
        return next({
            status: 400,
            message: "Order must include a dishes"
        })
    }
    return next();
}

function dishesHaveQuantity(req, res, next) {
    if (!Array.isArray(req.body.data.dishes) || req.body.data.dishes.length === 0) {
        return next({
            status: 400,
            message: "Order must include at least one dish"
        })
    }
    for (let i = 0; i < req.body.data.dishes.length; i++) {
        if (typeof req.body.data.dishes[i].quantity !== "number" || !req.body.data.dishes[i].quantity) {
            return next({
                status: 400,
                message: `Dish ${i} must have a quantity that is an integer greater than 0`
            })
        }
    }
    return next();
}

function routeIdMatchesBody(req, res, next) {
    if (req.body.data.id && req.body.data.id !== res.locals.orderId) {
        return next({
            status: 400,
            message: `Order id does not match route id. Order: ${req.body.data.id}, Route: ${res.locals.orderId}`
        })
    }
    return next();
}

function isNotDelivered(req, res, next) {
    if (res.locals.foundOrder.status === "delivered") {
        return next({
            status: 400,
            message: "A delivered order cannot be changed"
        })
    }
    return next();
}

function statusValidation(req, res, next) {
    if (!req.body.data.status) {
        return next({
            status: 400,
            message: "Order must have a status of pending, preparing, out-for-delivery, delivered"
        })
    }
    if (!["pending", "preparing", "out-for-delivery", "delivered"].includes(req.body.data.status)) {
        return next({
            status: 400,
            message: "Invalid status"
        })
    }
    return next();
}

function isNotPending(req, res, next) {
    const index = orders.findIndex((order) => order.id === res.locals.foundOrder.id);
    res.locals.index = index;
    if (orders[index].status !== "pending") {
        return next({
            status: 400,
            message: "Order must be pending to be deleted"
        })
    }
    return next();
}

function list(req, res, next) {
    res.json({ data: orders })
}

function create(req, res) {
    const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;
    const newOrder = {
        id: nextId(),
        deliverTo,
        mobileNumber,
        dishes
    }
    orders.push(newOrder);
    res.status(201).json({ data: newOrder }) 
}

function read(req, res, next) {
    res.json({ data: res.locals.foundOrder })
}

function update(req, res, next) {
    const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
    const updatedOrder = {
        deliverTo,
        mobileNumber,
        status,
        dishes
    }
    Object.assign(res.locals.foundOrder, updatedOrder)
    res.json({ data: res.locals.foundOrder })
}

function destroy(req, res, next) {
    orders.splice(res.locals.index, 1);
    res.sendStatus(204);
}

module.exports = {
    list,
    read: [orderExists, read],
    create: [hasDeliverTo, hasMobileNumber, hasDishes, dishesHaveQuantity, create],
    update: [orderExists, routeIdMatchesBody, statusValidation, isNotDelivered, hasDeliverTo, hasMobileNumber, hasDishes, dishesHaveQuantity, update],
    destroy: [orderExists, isNotPending, destroy]
}
