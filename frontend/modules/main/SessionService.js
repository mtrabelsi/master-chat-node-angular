

mainModule.factory('Session',['$cookieStore', function($cookieStore) {

  return {
		    setKey: function(key,value) {

		    	    	$cookieStore.put(key, value);
		    },
		    getKey: function(key) {

		    	return  $cookieStore.get(key);
		    },
		    removeKey: function(key){

		    			$cookieStore.remove(key);
		    }

  		 };
}]);