var app = angular.module('flapperNews', ['ui.router']);

app.config([
	'$stateProvider',
	'$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {

		$stateProvider
		.state('home', {
			url: '/home',
			templateUrl: '/home.html',
			controller: 'MainCtrl'
		}).state('posts', {
		  url: '/posts/{id}',
		  templateUrl: '/post.html',
		  controller: 'PostsCtrl',
		  resolve: {
	      	post: ['$stateParams', 'posts', function($stateParams, posts) {
	          return posts.get($stateParams.id);
	        }]
	      }
		});

		$urlRouterProvider.otherwise('home');
	}]);

app.controller('PostsCtrl', ['$scope','posts','post',

	function($scope, posts,post){

		$scope.post = post.data;
		// $scope.post = post

		$scope.addComment = function(){
			  if($scope.body === '') { return; }
			  $scope.post.comments.push({
			    body: $scope.body,
			    author: 'user',
			    upvotes: 0
			  });
			  $scope.body = '';
			};

	}
]);

app.controller('MainCtrl', ['$scope','posts',
	function($scope,posts){

		var ajax = posts.getData();

		ajax.success(function(data,status){
			$scope.posts = posts.posts
		});

		

		$scope.addPost = function(){

			if(!$scope.title || $scope.title === '') { return; }

			// $scope.posts.push({
			// 	title: $scope.title,
			// 	link: $scope.link,
			// 	upvotes: 0,
			// 	 comments: [
			//     {author: 'Joe', body: 'Cool post!', upvotes: 0},
			//     {author: 'Bob', body: 'Great idea but everything is wrong!', upvotes: 0}
			//   ]
			// });

			ajax = posts.create({
				title:$scope.title,
				link:$scope.link
			});

			ajax.success(function(){

				$scope.title = '';
				$scope.link = '';


			})

			
		};

		$scope.incrementUpvotes = function(post){
			posts.upvote(post);
		}



	}]);

app.factory('posts', ['$http',function($http){
	var o = {
	    posts: []
	  };

	o.getData = function() {
    	return $http.get('/posts').success(function(data){
      		angular.copy(data, o.posts);
    	});
 	};

 	o.create = function(post) {
	  return $http.post('/posts', post).success(function(data){
	    o.posts.push(data);
	  });
	};

	o.upvote = function(post) {
	  return $http.put('/posts/' + post._id + '/upvote')
	    .success(function(data){
	      post.upvotes += 1;
	    });
	};

	o.get = function(id) {

	  var ajax = $http.get('/posts/' + id)

	  return ajax.success(function(data){

	    return data;

	  });
	};

 	return o;

}]);