/*  sortAndTrimRestaurants: takes an array of restaurant objects and  *
 *    sorts it by the cheapest price of the matched item, and then    *
 *    truncates the list to size 10.                                  */
function sortAndTrimRestaurants(r_array) {
	return r_array.sort(function(a, b) {
		if (a.matched_items[0] != undefined && b.matched_items[0] != undefined) {
			if (a.matched_items[0].price < b.matched_items[0].price)
				return -1;
			if (a.matched_items[0].price > b.matched_items[0].price)
				return 1;
		}
		return 0;
	}).slice(0, 10);
}

function optimizeOrders(r_array) {
	var new_orders = []
	optimizeOrder(r_array, 0, [], function(final_orders) {
		new_orders = final_orders;
	});
	return new_orders;

}

function optimizeOrder(restaurants_array, index, orders, callback) {
	if (restaurants_array[index] != undefined && orders.length < 10) {
		restaurant = restaurants_array[index];
		order = {};
		items = [];
		items.push(restaurant.matched_items[0]);
		order["restaurant"] = restaurant;
		order["items"] = items;
		orderCheck(orders, order, function(orders_array) {	
			optimizeOrder(restaurants_array, index + 1, orders_array, callback);
		});
	}
	else {
		callback(orders);
	}
}

function orderCheck(r_orders, this_order, callback) {
	if (sumItems(this_order.items) >= this_order.restaurant.min) {
		r_orders.push( this_order );
		callback(r_orders);
	}
	else {
		this_order.items.push(popCheapestItem(this_order.restaurant.other_items));
		orderCheck(r_orders, this_order, callback);
	}

}

// sumItems: returns the sum of the items in an array
function sumItems(items_array) {
	var sum = 0;
	for (i in items_array) {
		item = items_array[i];
		if (item != undefined) {
			sum += item.price;
		}
	}
	return sum;
}

function popCheapestItem(items_array) {
	return items_array.sort(function(a, b) {
		if (a.price < b.price)
			return 1;
		if (a.price > b.price)
			return -1;
		return 0;
	}).pop();
}
