var app = angular.module('HandyPinApp');

/*Map part*/
app.controller('mainController', function($scope, currentPosition, APIHelper, $compile, $state, uiGmapGoogleMapApi) {
	$scope.currentPosition = currentPosition;
	$scope.pins = []

	uiGmapGoogleMapApi.then(function(maps) {
		$scope.selfMarker = {
			position : {
				latitude: currentPosition.coords.latitude,
	    		longitude: currentPosition.coords.longitude
			},
			options : {
				icon : {
					url: "res/subway-maps-australia-16-l-124x124.png",
					scaledSize: new maps.Size(60, 60)
				},
				animation : maps.Animation.DROP,
				clickable: false
			}
		}
	})

    $scope.map = { 
    	center: { 
    		latitude: currentPosition.coords.latitude,
    		longitude: currentPosition.coords.longitude
    	},
    	zoom: 16,
    	options : {
		    styles : [
						    {
						        "stylers": [
						            {
						                "hue": "#dd0d0d"
						            }
						        ]
						    },
						    {
						        "featureType": "road",
						        "elementType": "labels",
						        "stylers": [
						            {
						                "visibility": "off"
						            }
						        ]
						    },
						    {
						        "featureType": "road",
						        "elementType": "geometry",
						        "stylers": [
						            {
						                "lightness": 100
						            },
						            {
						                "visibility": "simplified"
						            }
								]
		    				}
						]
	    },
	    bounds: {},
	    events: {
	    	idle: function(mapModel, eventName) {
    		    APIHelper
			    .searchPins({
			    	sw_longitude : mapModel.getBounds().getSouthWest().lng(),
			    	sw_latitude : mapModel.getBounds().getSouthWest().lat(),
			    	ne_longitude : mapModel.getBounds().getNorthEast().lng(),
			    	ne_latitude : mapModel.getBounds().getNorthEast().lat(),
			    	keyword : $scope.keyword? $scope.keyword:null
			    })
			    .then(function(pins) {
			    	pins.forEach(function(pin) {
			    		existing_pins = $scope.pins.map(function(existing_pin){return existing_pin.id})
			    		if(existing_pins.indexOf(pin.id) == -1){
			    			$scope.pins.push(pin)
			    		} 
			    	})
			    }).catch(function(pins){
			    	$scope.pins = []
			    })
	    	}
	    }
    };

    $scope.searchbox = {
    	template : 'partials/common/searchBox.html'
    }

    $scope.menuButton = {
    	template : 'partials/common/menuButton.html'
    }

    $scope.recenterButton = {
    	template : 'partials/common/recenterButton.html'
    }

    $scope.$on('keywordChanged', function(event, args) { 
    	$scope.keyword = args
    	APIHelper
	    .searchPins({
	    	sw_longitude : $scope.map.bounds.southwest.longitude,
	    	sw_latitude : $scope.map.bounds.southwest.latitude,
	    	ne_longitude : $scope.map.bounds.northeast.longitude,
	    	ne_latitude : $scope.map.bounds.northeast.latitude,
	    	keyword : $scope.keyword? $scope.keyword:null
	    })
	    .then(function(pins) {
	    	$scope.pins = pins
	    }).catch(function(pins){
			$scope.pins = []
		})
    })

	$scope.$on('newPinCreated', function(event, args) {
		$scope.pins.push(args)
		$state.go('^.home')
	})

	$scope.$on('recenter', function(event, args) {
		$scope.map.center = { 
			latitude: currentPosition.coords.latitude,
    		longitude: currentPosition.coords.longitude
    	}

    	$scope.map.zoom = 16 
	})
})

app.controller('searchBoxCtrl', function($rootScope, $scope, APIHelper, uiGmapGoogleMapApi) {
    $scope.submitSearchKeyword = function() {
    	$rootScope.$broadcast('keywordChanged', $scope.searchString);
    }
})

app.controller('menuButtonCtrl', function($rootScope, $scope, $state) {
    $scope.toggleMenu = function() {
    	$rootScope.isCollapsedHorizontal = !$rootScope.isCollapsedHorizontal
    	$state.go('^.home')
    }
})

app.controller('recenterButtonCtrl', function($rootScope, $scope, $state) {
    $scope.recenter = function() {
    	$rootScope.$broadcast('recenter');
    }
})

/*Sidebar part*/
app.controller('authHomeSideNavCtrl', function($scope, $rootScope, $state, AuthService, alertHelper) {
	$scope.user = AuthService.getUser()

	$scope.submitSignoutRequest = function() {
		AuthService
			.logout()
			.then(function() {
				alertHelper.alertMsg('You have successfully signed out')
				$state.go('unauth.home')
			})
	}
})

app.controller('unauthHomeSideNavCtrl', function($scope, $state) {
})

app.controller('loginCtrl', function($scope, $state, $rootScope, AuthService, alertHelper) {
	$scope.submitLoginRequest = function() {
		if($scope.loginForm.$valid)
		{
			AuthService
				.login($scope.username, $scope.password)
				.then(function() {
					$scope.username = ''
					$scope.password = ''
					$state.go('auth.home')
				})
				.catch(function() {
					$scope.username = ''
					$scope.password = ''
					alertHelper.alertMsg('Invalid username password combination')
				})
		}
	}
})

app.controller('newPinCtrl', function($scope, $rootScope, $state, APIHelper, geolocationSvc, AuthService, uiGmapGoogleMapApi) {
	$scope.user = AuthService.getUser()

	$scope.submitPostPinRequest = function () {
		if($scope.newPinForm.$valid)
		{
			tag_string_array = null

			if($scope.tag_string) {
				tag_string_array = $scope.tag_string.split(' ')
			}

			geolocationSvc.getCurrentPosition().then(function(currentPosition){
				APIHelper.postPin({
					title: $scope.title,
					short_title: $scope.title.substring(0, 10),
					description: $scope.description? $scope.description:null,
					owner_id: $scope.user? $scope.user.id : -1,
					longitude: currentPosition.coords.longitude,
					latitude: currentPosition.coords.latitude,
					tag_strings: tag_string_array? tag_string_array:null
				}).then(function(pin){
					uiGmapGoogleMapApi.then(function(maps){
						pin.options.animation = maps.Animation.DROP
						$rootScope.$broadcast('newPinCreated', pin)
						$rootScope.isCollapsedHorizontal = true
					})
				}).catch(function(error){
					console.log("Error posting pin: " + error)
				})
			})
			.catch(function(error){
				console.log("Error getting current position" + error)
			})
		}

	}
})

app.controller('viewPinCtrl', function($rootScope, $scope, $state, pin, APIHelper, AuthService) {
	$scope.user = AuthService.getUser()

	$rootScope.isCollapsedHorizontal = false
	$scope.pin = pin

	$scope.submitCommentRequest = function() {
		if($scope.commentForm.$valid)
		{
			APIHelper.postComment({
				owner_id: $scope.user? $scope.user.id : -1,
				pin_id: $scope.pin.id,
				content: $scope.new_comment
			}).then(function(comment){
				$scope.pin.comments.push(comment)
			})
			.catch(function(error){
				console.log("Error commenting")
			})
		}
	}
})

app.controller('infoWindowCtrl', function($scope, $state) {
	$scope.showDetailOnclick = function() {
		//hacky method to get pin id
    	$state.go(
    		'^.viewPin',
    		{
    			pin_id: $scope.$parent.idKey
    		}
    	)
    }

	$scope.downVote = function() {
		//hacky method to get pin id
		pin_id = $scope.$parent.idKey
	}

	$scope.upVote = function() {
		//hacky method to get pin id
		pin_id = $scope.$parent.idKey
	}
})