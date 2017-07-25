var app = angular.module('myApp', ['ngRoute', 'firebase']);

app.config(function($routeProvider, $locationProvider) {
    $locationProvider.hashPrefix('!');
    $routeProvider
        .when('/', {
            'templateUrl': 'login.html',
            'controller': 'loginController'
        })

    .when('/home', {
        'templateUrl': 'home.html',
        'controller': 'homeController'
    })

    .when('/register', {
        'templateUrl': 'register.html',
        'controller': 'registerController'
    })

    .otherwise({
        redirectTo: '/'
    })
});

app.service('myService', function($location, $firebaseAuth) {
    var user = '';
    var auth = $firebaseAuth();
    return {
        getUser: function() {
            if (user == '') {
                user = localStorage.getItem('userEmail');
            }
            return user;
        },
        setUser: function(value) {
            localStorage.setItem('userEmail', value);
            user = value;
        },
        logoutUser: function() {
            auth.$signOut()
                .then(function() {
                    user = '';
                    localStorage.removeItem('userEmail');
                    localStorage.clear();
                    $location.path('/login');
                    console.log('Loged out');
                })
                .catch(function(error) {
                    console.log(error);
                })
        }
    }
});

app.controller('loginController', function($scope, $firebaseAuth, $location, myService) {
    $scope.username = myService.getUser();
    if ($scope.username) {
        $location.path('/home');
    }

    $scope.login = function() {
        var username = $scope.user.email;
        var password = $scope.user.password;
        var myAuth = $firebaseAuth();
        myAuth.$signInWithEmailAndPassword(username, password)
            .then(function(user) {
                console.log(user.uid);
                myService.setUser($scope.user.email);
                $location.path('/home');
            })
            .catch(function(error) {
                console.log(error);
            })
        myAuth.$onAuthStateChanged(function(firebaseUser) {
            if (firebaseUser) {
                console.log('Signed in as ', firebaseUser.uid);
            } else {
                console.log('Signed out');
            }
        });
    }
    
});

app.controller('homeController', function($scope, $firebaseAuth, $location, myService, $firebaseArray) {
    var ref = firebase.database().ref('Users');
    $scope.data = $firebaseArray(ref);

    // var ref2 = firebase.database().ref('Attendance');
    // $firebaseArray(ref2).$add($scope.checkboxModel);
    // $scope.checkboxVal = $firebaseArray(ref2);

    $scope.username = myService.getUser();
    if (!$scope.username) {
        $location.path('/login');
    }
    $scope.logout = function() {
        myService.logoutUser();
    }
});

app.controller('registerController', function($scope, $firebaseAuth, $firebaseArray, $location) {
    $scope.register = function() {
        var username = $scope.user.email;
        var password = $scope.user.password;
        var auth = $firebaseAuth();
        auth.$createUserWithEmailAndPassword(username, password)
            .then(function(user) {
                if (!user) {
                    alert('user already taken');
                    console.log('user already available');
                } else {
                    auth.$onAuthStateChanged(function(user) {
                        if (user) {
                            var ref = firebase.database().ref('Users');
                            $firebaseArray(ref).$add($scope.user)
                            console.log('wow');
                        }
                    })
                }
                console.log(user.uid);
                $location.path('/login');
            })
            .catch(function(error) {
                console.log(error);
            })
    }
});