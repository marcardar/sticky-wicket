Element = function () {};

Element.prototype.getAttribute = function (attribute) {
	if (attribute == "class") attribute = "className";
	if (attribute == "for") attribute = "htmlFor";
	return this[attribute];
}

Element.prototype.setAttribute = function (attribute, value) {
	if (attribute == "class") attribute = "className";
	if (attribute == "for") attribute = "htmlFor";
	this[attribute] = value;
}

var __IEcreateElement = document.createElement;

document.createElement = function (tagName) {
	var element = __IEcreateElement(tagName);

	var interface = new Element;
	for (method in interface)
		element[method] = interface[method];

	return element;
}
