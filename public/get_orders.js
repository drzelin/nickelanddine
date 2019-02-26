function get_orders(fooditem, _callback) {	
	base_url = "https://quiet-mesa-7734.herokuapp.com/";
	url = base_url + "get_menus";
	
	params = "fooditem=" + fooditem;
	$.get(url + '?' + params).done(function(body) {
			return get_fees(body, 0, body.length);
			});
	function get_fees(body, index, length) {
		if (index != length && body[index] != undefined) {
			$.get(base_url + 'get_fees' + '?restaurant=' + body[index].name).done( function(fees) {
					if (fees == "") {
					body.splice(index, 1);
					get_fees(body, index, length)
					}
					else {
					body[index].fee = fees["Delivery Fee"];
					body[index].min = fees["Minimum"];
					get_fees(body, index+1, length);

					}
					});
		}
		else { // went through array 
			for (i=0; i < 57; i++) {
				separate_items(body, i);
			}
			_callback (optimizeOrders (sortAndTrimRestaurants(body)) );
		}

	}
	function separate_items(restaurants, index) {
		restaurant = restaurants[index];
		if (restaurant != undefined && restaurant.menu != undefined) {
			menu = restaurant.menu;
			matched_items = [];
			other_items = [];
			for (j=0; j < menu.length; j++) {
				if (menu[j].food.toLowerCase().indexOf( query.fooditem.toLowerCase() ) != -1 ) {
					item = menu.splice(j,1)[0];
					item.price = parseFloat(item.price);
					matched_items.push( item );
				}
				else {
					item = menu.splice(j,1)[0];
					item.price = parseFloat(item.price);
					if (parseFloat(item.price) > 0.75) other_items.push( item );
				}
			}
			if (matched_items.length == 0) delete restaurants[index];
			else {
				restaurant.matched_items = matched_items;
				restaurant.other_items = other_items;
				delete menu;
			}
		}
	}

}

