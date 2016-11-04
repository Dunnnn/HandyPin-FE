'use strict';

var app = angular.module('HandyPinApp', ['ui.bootstrap', 'ngAnimate',
	'angularSpinner', 'ui.router', 'uiGmapgoogle-maps']);

app.config(['usSpinnerConfigProvider', function (usSpinnerConfigProvider) {
    usSpinnerConfigProvider.setDefaults({radius:6, length: 1});
}]);

app.config(function(uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
        //    key: 'your api key',
        v: '3.20', //defaults to latest 3.X anyhow
        libraries: 'weather,geometry,visualization,places',
        key: 'AIzaSyCe4fuOg-Njod6WBo8P6UPeWhOaOdErsgE'
    });
})

app.config(function($stateProvider, $urlRouterProvider) {
	 $stateProvider.state('unauth', {
	 	abstract: true,
	 	url: '/unauth',
	 	views: {
	        'map@' : {
	        	templateUrl: '/partials/common/map.html',
	         	controller: 'mainController'
	      	}
	    },
	    resolve: {
	    	currentPosition:  function(geolocationSvc) {
	    		return geolocationSvc.getCurrentPosition()
	    	}
	    }
	})
	.state('unauth.home', {
	 	url: '/home',
	 	views: {
	        'sidenav@' : {
	        	templateUrl: '/partials/unauth/homeSideNav.html',
	         	controller: 'unauthHomeSideNavCtrl'
	      	}
	    },
	    auth_redirect: 'auth.home'
	 })
	.state('unauth.login', {
	 	url: '/login',
	 	views: {
	        'sidenav@' : {
	        	templateUrl: '/partials/unauth/login.html',
	         	controller: 'loginCtrl'
	      	}
	    },
	    auth_redirect: 'auth.home'
	 })
	 .state('auth', {
	 	abstract: true,
	 	url: '/auth',
	 	views: {
	        'map@' : {
	        	templateUrl: '/partials/common/map.html',
	         	controller: 'mainController'
	      	}
	    },
	    resolve: {
	    	currentPosition:  function(geolocationSvc) {
	    		return geolocationSvc.getCurrentPosition()
	    	}
	    }
	 })
	 .state('auth.home', {
	 	url: '/home',
	 	views: {
	        'sidenav@' : {
	        	templateUrl: '/partials/auth/homeSideNav.html',
	         	controller: 'authHomeSideNavCtrl'
	      	}
	    },
	    unauth_redirect: 'unauth.home'
	 })
	 .state('unauth.newPin', {
	 	url: '/newPin',
	 	views: {
	        'sidenav@' : {
	        	templateUrl: '/partials/common/newPin.html',
	         	controller: 'newPinCtrl'
	      	}
	    },
	    auth_redirect: 'auth.newPin'
	 })
	 .state('auth.newPin', {
	 	url: '/newPin',
	 	views: {
	        'sidenav@' : {
	        	templateUrl: '/partials/common/newPin.html',
	         	controller: 'newPinCtrl'
	      	}
	    },
	    unauth_redirect: 'unauth.newPin'
	 })
     .state('auth.viewPin', {
	 	url: '/viewPin?pin_id',
	 	views: {
	        'sidenav@' : {
	        	templateUrl: '/partials/common/viewPin.html',
	         	controller: 'viewPinCtrl'
	      	}
	    },
	    unauth_redirect: 'unauth.viewPin',
	    resolve: {
	    	pin:  function(APIHelper, $stateParams) {
	    		return APIHelper.getPin($stateParams)
	    	}
	    }
	 })
	 .state('unauth.viewPin', {
	 	url: '/viewPin?pin_id',
	 	views: {
	        'sidenav@' : {
	        	templateUrl: '/partials/common/viewPin.html',
	         	controller: 'viewPinCtrl'
	      	}
	    },
	    auth_redirect: 'auth.viewPin',
	    resolve: {
	    	pin:  function(APIHelper, $stateParams) {
	    		return APIHelper.getPin($stateParams)
	    	}
	    }
	 })

	 $urlRouterProvider.otherwise('/unauth/home');
})

app.run(function($rootScope, $state) {
	$rootScope.isCollapsedHorizontal = true

	$rootScope.closeMenu = function() {
		$rootScope.isCollapsedHorizontal = true;
		$state.go('^.home')
	}
})

/* Temporarily commented out for further fix
app.run(function ($rootScope, $state, AuthService) {
  //Important authenticaion process. Think through before making any change.
  $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams){
    if(!angular.equals($rootScope.toState, toState) || !angular.equals($rootScope.toParams, toParams))
    {
      event.preventDefault();

      $rootScope.toState = toState
      $rootScope.toParams = toParams

      AuthService.loadCurrentUser()
        .then(function(){
          if(toState.auth_redirect){
            $state.transitionTo(toState.auth_redirect, toParams, {reload:true});
          } else {
            $state.transitionTo(toState, toParams);
          }
        }, function(){
          if(toState.unauth_redirect){ 
            $state.transitionTo(toState.unauth_redirect, toParams, {reload:true});
          } else {
            $state.transitionTo(toState, toParams);
          }
        })
    } else {
      $rootScope.toState = null
      $rootScope.toParams = null
    }
  });
});
*/