var app = angular.module('HandyPinApp');

app.factory('geolocationSvc', ['$q', '$window', function ($q, $window) {

    function getCurrentPosition() {
        var deferred = $q.defer();

        if (!$window.navigator.geolocation) {
            deferred.reject('Geolocation not supported.');
        } else {
            $window.navigator.geolocation.getCurrentPosition(
                function (position) {
                    deferred.resolve(position);
                },
                function (err) {
                    deferred.reject(err);
                });
        }

        return deferred.promise;
    }

    return {
        getCurrentPosition: getCurrentPosition
    };
}]);

app.factory('AuthService',
  function ($q, $timeout, $http, $rootScope) {

    // create user variable
    var user = null;
    var factory = {
      login: login,
      logout: logout,
      loadCurrentUser: loadCurrentUser,
      getUser: getUser,
      updateUser: updateUser,
    }

    // return available functions for use in controllers
    return factory;

    function getUser() {
        return user;
    }

    function login(username, password) {

        var deferred = $q.defer();

        // send a post request to the server
        $http({
            withCredentials: true,
            method: 'GET',
            url : 'https://ec2-54-208-245-21.compute-1.amazonaws.com/auth/signin', 
            params: {
                username: username,
                password: password
            }
        })
        // handle success
        .success(function (data, status) {
            if(status === 200){
                user = data;
                deferred.resolve();
            } else {
                user = null;
                deferred.reject();
            }

        })
        // handle error
        .error(function (data) {
          user = null;
          deferred.reject();

        });

    

      // return promise object
        return deferred.promise;

    }

    function logout() {
        // create a new instance of deferred
        var deferred = $q.defer();

        // send a get request to the server
        $http({
            withCredentials: true,
            url: 'https://ec2-54-208-245-21.compute-1.amazonaws.com/auth/signout',
            method: 'GET'
        })
        // handle success
        .success(function (data) {
          user = null;
          deferred.resolve();
        })
        // handle error
        .error(function (data) {
          user = null;
          deferred.reject();
        });
        // return promise object
        return deferred.promise;
    }

    function loadCurrentUser() {
        var deferred = $q.defer();

        $http({
            method: 'GET',
            withCredentials: true,
            url: 'https://ec2-54-208-245-21.compute-1.amazonaws.com/auth/current_user'
        })
        .success(function (data, status) {
            if(status === 200){
                user = data;
                deferred.resolve();
            } else {
              user = null;
              deferred.reject();
            }
        })
        .error(function (data) {
            user = null;
            deferred.reject();
        });

        return deferred.promise;
    }

    function updateUser(params){
        return $http({
            method: 'PUT',
            url : 'https://ec2-54-208-245-21.compute-1.amazonaws.com/api/users/' + params.user_id,
            params: params,
            withCredentials: true
        }).then(function(data, status){
            user = data.data
            return data.data
        })
    }

});

app.factory('APIHelper', function($q, $http, AuthService) {
    var factory = {}

    factory.searchPins = searchPins
    factory.getPin = getPin
    factory.postPin = postPin
    factory.postComment = postComment

    function searchPins(params) {
        return $http({
            method: 'GET',
            url : 'https://ec2-54-208-245-21.compute-1.amazonaws.com/api/pins',
            params: params,
            withCredentials: true
        }).then(function(data, status){
            return data.data
        })
    }

    function getPin(params) {
        return $http({
            method: 'GET',
            url : 'https://ec2-54-208-245-21.compute-1.amazonaws.com/api/pins/' + params.pin_id,
            params: params,
            withCredentials: true
        }).then(function(data, status){
            return data.data
        })
    }

    function postPin(params) {
        return $http({
            method: 'POST',
            url : 'https://ec2-54-208-245-21.compute-1.amazonaws.com/api/pins',
            params: params
        }).then(function(data, status){
            return data.data
        })
    }

    function postComment(params) {
        return $http({
            method: 'POST',
            url : 'https://ec2-54-208-245-21.compute-1.amazonaws.com/api/comment',
            params: params
        }).then(function(data, status){
            return data.data
        })
    }

    return factory
})