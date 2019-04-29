const express = require('express');
const app = express();
const jsonParser = express.json();

// 200 - успешно
// 401 - неправильный логин или пароль
// 310 - логин уже занят
// 311 - пользователь с этим email уже зарегестрирован
// 315 - продукта с таким id не существует
// 316 - продукт уже добавлен в корзину

var PRODUCT_UNSELECT_STATUS = 0;
var PRODUCT_SELECT_STATUS = 1;

app.post('/auth/login', jsonParser, function (request, response) {
	var resp = null;
	if (isAuth(request.body.login, request.body.password)) {
		resp = {
			status: {
				code: "200",
				message: "success"
			}
		};
	} else {
		resp = {
			status: {
				code: "401",
				message: "error"
			}
		};
	}
	response.setHeader("Content-Type", "application/json");
	response.send(JSON.stringify(resp));
});

app.post('/auth/registration', jsonParser, function (request, response) {
	var person = request.body;
	var resp = null;
	if (checkEmail(person)) {
		if (checkLogin(person)) {
			addPerson(request.body);
			resp = {
				status: {
					code: "200",
					message: "success"
				}
			};
		} else {
			resp = {
				status: {
					code: "310",
					message: "error"
				}
			};
		}
	} else {
		resp = {
			status: {
				code: "311",
				message: "error"
			}
		};
	}
	response.setHeader("Content-Type", "application/json");
	response.send(JSON.stringify(resp));
});

app.get('/market/categories', function (request, response) {
	var resp = {
		data: categories,
		status: {
			code: "200",
			message: "success"
		}
	};
	response.setHeader("Content-Type", "application/json");
	response.send(JSON.stringify(resp));
});



app.get('/api/notifications/1', function (request, response) {
	var resp = {
		data: {
			id: 8,
			type: "news",
			title: "qweqweqwe",
			body: "<p>wqeqweqwe</p>",
			platform: "all",
			created_at: "2019-04-18 13:15:48",
			updated_at: "2019-04-18 13:15:48"
		},
		status: {
			message: "Success",
			description: "Успешно",
			status_code: 0
		}
	};
	response.setHeader("Content-Type", "application/json");
	response.send(JSON.stringify(resp));
});

app.get('/api/notifications/list', function (request, response) {

	ar = [{
		id: 8,
		type: "news",
		title: "qweqweqwe",
		body: "<p>wqeqweqwe</p>",
		platform: "all",
		created_at: "2019-04-18 13:15:48",
		updated_at: "2019-04-18 13:15:48"
	},
	{
		id: 9,
		type: "products",
		title: "qweqweqwe",
		body: "<p>wqeqweqwe</p>",
		platform: "all",
		created_at: "2019-04-18 13:17:48",
		updated_at: "2019-04-18 13:17:48"
	}];

	var resp = {
		data: ar,
		status: {
			message: "Success",
			description: "Успешно",
			status_code: 0
		}
	};
	response.setHeader("Content-Type", "application/json");
	response.send(JSON.stringify(resp));
});

app.get('/market/categories/:category_id/products', function (request, response) {
	catId = parseInt(request.params["category_id"]);
	var productList = getProductListByCategoryId(catId);
	var resp = {
		data: productList,
		status: {
			code: "200",
			message: "success"
		}
	};
	response.setHeader("Content-Type", "application/json");
	response.send(JSON.stringify(resp));
});

app.get('/market/categories/:category_id/products/:product_id', function (request, response) {
	catId = parseInt(request.params["category_id"]);
	prodId = parseInt(request.params["product_id"]);
	var product = null;
	if (catId === -1) {
		product = getProductById(products, prodId);
	} else {
		product = getProductById(getProductListByCategoryId(catId), prodId);
	}
	var resp = {
		data: product,
		status: {
			code: "200",
			message: "success"
		}
	};
	response.setHeader("Content-Type", "application/json");
	response.send(JSON.stringify(resp));
});

app.get('/market/basket/add', function (request, response) {
	prodId = parseInt(request.query.id);
	var resp = null;
	var product = getProductById(products, prodId);
	if (product != null) {
		if (!checkProductInBasket(prodId)) {
			product.status = PRODUCT_SELECT_STATUS;
			resp = {
				data: { status: PRODUCT_SELECT_STATUS },
				status: {
					code: "200",
					message: "success"
				}
			};
		} else {
			resp = {
				status: {
					code: "316",
					message: "Продукт уже добавлен в корзину"
				}
			};
		}
	} else {
		resp = {
			status: {
				code: "315",
				message: "Продукта с указанным id не существует"
			}
		};
	}
	response.setHeader("Content-Type", "application/json");
	response.send(JSON.stringify(resp));
});

app.get('/market/basket/remove', function (request, response) {
	prodId = parseInt(request.query.id);
	var resp = null;
	var product = getProductById(products, prodId);
	if (product != null) {
		if (checkProductInBasket(prodId)) {
			product.status = PRODUCT_UNSELECT_STATUS;
			resp = {
				data: { status: PRODUCT_UNSELECT_STATUS },
				status: {
					code: "200",
					message: "success"
				}
			};
		} else {
			resp = {
				status: {
					code: "317",
					message: "Продукта нет в корзине"
				}
			};
		}
	} else {
		resp = {
			status: {
				code: "315",
				message: "Продукта с указанным id не существует"
			}
		};
	}
	response.setHeader("Content-Type", "application/json");
	response.send(JSON.stringify(resp));
});

app.get('/market/basket/checkout', function (request, response) {
	var resp = {
		data: getBasketProducts(),
		status: {
			code: "200",
			message: "success"
		}
	};
	response.setHeader("Content-Type", "application/json");
	response.send(JSON.stringify(resp));
});

app.listen(3000, function () {
	console.log('Example app listening on port 3000!');
});

class Person {
	constructor(id, firstName, lastName, email, login, password) {
		this.id = id;
		this.firstName = firstName;
		this.lastName = lastName;
		this.email = email;
		this.login = login;
		this.password = password;
	}
}

var persons = [
	new Person(1, "Alex", "Smit", "alex.smit@gmail.com", "AlexSmit", "qwerty123"),
	new Person(2, "Erik", "Lass", "erik.lass@gmail.com", "ErikLass", "12345qwerty")
];

function isAuth(login, password) {
	for (var i = 0; i < persons.length; i++) {
		if ((login === persons[i].login || login === persons[i].email) && password === persons[i].password) {
			return true;
		}
	}
	return false;
}

function addPerson(person) {
	if (persons.length == 0) {
		person.id = 1;
		persons.push(person);
	} else {
		person.id = persons[persons.length - 1].id + 1;
		persons.push(person);
	}
}

function checkEmail(person) {
	for (var i = 0; i < persons.length; i++) {
		if (person.email === persons[i].email) {
			return false;
		}
	}
	return true;
}

function checkLogin(person) {
	for (var i = 0; i < persons.length; i++) {
		if (person.login === persons[i].login) {
			return false;
		}
	}
	return true;
}

class Category {
	constructor(id, name) {
		this.id = id;
		this.name = name;
	}
}

var categories = [
	new Category(1, "Ноутбуки"),
	new Category(2, "Планшеты"),
	new Category(3, "Телефоны"),
	new Category(4, "Телевизоры"),
	new Category(5, "Процессоры"),
	new Category(6, "Видеокарты")
];

function getProductListByCategoryId(categoryId) {
	var list = [];
	for (i = 0; i < products.length; i++) {
		product = products[i];
		if (product.categoryId === categoryId) {
			list.push(product);
		}
	}
	return list;
}

function getProductById(productList, productId) {
	for (i = 0; i < productList.length; i++) {
		product = productList[i];
		if (product.id === productId) {
			return product;
		}
	}
	return null;
}

function checkProductInBasket(productId) {
	for (i = 0; i < products.length; i++) {
		product = products[i];
		if (product.id === productId && product.status === 1) {
			return true;
		}
	}
	return false;
}

function getBasketProducts() {
	var list = [];
	for (i = 0; i < products.length; i++) {
		product = products[i];
		if (product.status === PRODUCT_SELECT_STATUS) {
			list.push(product);
		}
	}
	return list;
}

class Product {
	constructor(id, name, price, count, status, categoryId) {
		this.id = id;
		this.name = name;
		this.price = price;
		this.count = count;
		this.status = status;
		this.categoryId = categoryId;
	}
}

var products = [
	/*new Product(1, "15.6\" Ноутбук HP 15 - db0054ur золотистый", "20 299 руб", 4, 0, 1),
	new Product(2, "15.6\" Ноутбук Acer Aspire 3 A315 - 41G - R3HU черный", "25 799 руб", 1, 0, 1),
	new Product(3, "15.6\" Ноутбук HP 15 - db0106ur черный", "24 499 руб", 3, 0, 1),
	new Product(4, "15.6\" Ноутбук Lenovo V130 - 15IKB серый", "25 299 руб", 2, 0, 1),
	new Product(5, "17.3\" Ноутбук ASUS VivoBook Pro 17 N705UF - GC105T серый", "50 999 руб", 0, 0, 1),*/

	new Product(6, "7\" Планшет Finepower E1 4 Гбайт 3G черный", "2 299 руб", 4, 0, 2),
	new Product(7, "7\" Планшет Huawei T3 7.0 8 Гбайт серый", "5 199 руб", 6, 0, 2),
	new Product(8, "10.1\" Планшет TurboPad 1016 16 Гбайт 3G, LTE черный", "5 999 руб", 2, 0, 2),
	new Product(9, "7\" Планшет Digma Optima 7018N 16 Гбайт 3G, LTE белый", "6 799 руб", 3, 0, 2),
	new Product(10, "7\" Планшет Lenovo TB - 7304I 16 Гбайт 3G черный", "6 899 руб", 3, 0, 2),

	new Product(11, "5.5\" Смартфон Samsung SM - J730F Galaxy J7 16 ГБ голубой", "10 999 руб", 2, 0, 3),
	new Product(12, "5.7\" Смартфон Honor 7C 32 ГБ синий", "10 999 руб", 4, 0, 3),
	new Product(13, "5.7\" Смартфон Meizu M8 64 ГБ фиолетовый", "10 999 руб", 5, 0, 3),
	new Product(14, "5.46\" Смартфон Meizu 15 Lite 32 ГБ золотистый", "12 999 руб", 3, 0, 3),
	new Product(15, "6.21\" Смартфон Huawei P Smart 2019 32 ГБ синий", "14 799 руб", 2, 0, 3),

	new Product(16, "20\"(50 см) Телевизор LED DEXP H20D7100E черный", "6 999 руб", 1, 0, 4),
	new Product(17, "32\"(80 см) Телевизор LED Erisson 32HLE19T2SM черный", "10 999 руб", 4, 0, 4),
	new Product(18, "24\"(60 см) Телевизор LED Samsung T24E310EX черный", "12 499 руб", 3, 0, 4),
	new Product(19, "24\"(60 см) Телевизор LED Samsung LT24H390SIX черный", "14 999 руб", 5, 0, 4),
	new Product(20, "32\"(81 см) Телевизор LED Hitachi 32HB4T01 черный", "15 499 руб", 0, 0, 4),
	new Product(21, "40\"(101 см) Телевизор LED Hyundai H - LED40F451BS2 черный", "17 499 руб", 3, 0, 4),

	new Product(22, "Процессор AMD Athlon 220GE OEM", "4 850 руб", 10, 0, 5),
	new Product(23, "Процессор Intel Celeron G4920 BOX", "5 299 руб", 15, 0, 5),
	new Product(24, "Процессор AMD Ryzen 3 2200G BOX", "6 999 руб", 6, 0, 5),
	new Product(25, "Процессор Intel Core i3-7100 BOX", "8 799 руб", 7, 0, 5),
	new Product(26, "Процессор AMD Ryzen 5 1600 BOX", "10 499 руб", 4, 0, 5),

	new Product(27, "Видеокарта ASUS GeForce GT 710 Silent LP [710-2-SL]", "4 150 руб", 2, 0, 6),
	new Product(28, "Видеокарта MSI GeForce GT 1030 LP OC [GT 1030 2GHD4 LP OC]", "5 599 руб", 4, 0, 6),
	new Product(29, "Видеокарта MSI GeForce GT 1030 AERO ITX OC [GT 1030 AERO ITX 2G OC]", "6 199 руб", 0, 0, 6),
	new Product(30, "Видеокарта ASUS AMD Radeon RX 560 STRIX [STRIX-RX560-4G-GAMING]", "12 499 руб", 1, 0, 6),
];