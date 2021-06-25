const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

function hasName(req, res, next) {
    if (!req.body.data.name) {
        return next({
            status: 400,
            message: "Dish must include a name"
        })
    }
    return next();
}

function hasDescription(req, res, next) {
    if (!req.body.data.description) {
        return next({
            status: 400,
            message: "Dish must include a description"
        })
    }
    return next();
}

function hasPrice(req, res, next) {
    if (!req.body.data.price) {
        return next({
            status: 400,
            message: "Dish must include a price"
        })
    }
    return next();
}

function hasImageUrl(req, res, next) {
    if (!req.body.data.image_url) {
        return next({
            status: 400,
            message: "Dish must include a image_url"
        })
    }
    return next();
}

function validatePrice(req, res, next) {
    const { data: { price } } = req.body;
    if (price < 1 || typeof(price) !== "number") {
        return next({
            status: 400,
            message: "Dish must have a price that is an integer greater than 0",
        })
    }
    return next();
}

function routeIdMatchesBody(req, res, next) {
    if (req.body.data.id && req.body.data.id !== res.locals.foundDish.id) {
        return next({
            status: 400,
            message: `Dish id does not match route id. Dish: ${req.body.data.id}, Route: ${res.locals.foundDish.id}`
        })
    }
    return next();
}

function dishExists(req, res, next) {
    const { dishId } = req.params;
    const foundDish = dishes.find((dish) => dish.id === dishId);
    if (foundDish) {
        res.locals.foundDish = foundDish;
        return next();
    }
    return next({
        status: 404,
        message: `Dish does not exist: ${dishId}`,
    })
}

function list(req, res) {
    res.json({ data: dishes })
}

function create(req, res, next) {
    const { data: { name, description, price, image_url } = {} } = req.body;
    const newDish = {
        id: nextId(),
        name,
        description,
        price,
        image_url,
    }
    dishes.push(newDish);
    res.status(201).json({ data: newDish })
}

function read(req, res, next) {
    res.json({ data: res.locals.foundDish })
} 

function update(req, res, next) {
    const { data: { id, name, description, price, image_url } = {} } = req.body;
    const updatedDish = { 
        name, 
        description,
        price, 
        image_url
    }
    Object.assign(res.locals.foundDish, updatedDish);
    res.json({ data: res.locals.foundDish })
}

module.exports = {
    list,
    create: [hasName, hasDescription, hasPrice, hasImageUrl, validatePrice, create],
    read: [dishExists, read],
    update: [dishExists, hasName, hasDescription, hasPrice, validatePrice, hasImageUrl, routeIdMatchesBody, update]
}