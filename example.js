'use strict';


const AxiosResources = require('./index.js');


////////////////////////////////////////////////////////////


//Axios Resource initial config
const objConfig = {
  host: 'https://jsonplaceholder.typicode.com'
};


//Axios Resource Instance
const objAxiosResources = AxiosResources(objConfig);


//Post Source
const objPostSource = objAxiosResources.source('posts', {
  getById: {
    method: 'GET',
    endpoint: 'posts/:id',
    params: ['id']
  },
  getPostComments: {
    method: 'GET',
    endpoint: 'posts/:id/comments',
    params: ['id']
  }
});


////////////////////////////////////////////////////////////


// GET https://jsonplaceholder.typicode.com/posts HTTP/1.1
objPostSource.get().then((results) => {
  // success
  console.log(results);
})
.catch((error) => {
  // error
  console.log(error);
});


// GET https://jsonplaceholder.typicode.com/posts?userId=1 HTTP/1.1
objPostSource.get({ userId: 1 }).then((results) => {
  // success
  console.log(results);
})
.catch((error) => {
  // error
  console.log(error);
});


// POST https://jsonplaceholder.typicode.com/posts HTTP/1.1
const objCreatePayload = {
  title: 'foo',
  body: 'bar',
  userId: 1
};

objPostSource.post(objCreatePayload).then((results) => {
  // success
  console.log(results);
})
.catch((error) => {
  // error
  console.log(error);
});


// PUT https://jsonplaceholder.typicode.com/posts/1 HTTP/1.1
const objUpdatePayload = {
  id: 1, // This will be added to the URL
  title: 'foo2',
  body: 'bar',
  userId: 1
};

objPostSource.update(objUpdatePayload).then((results) => {
  // success
  console.log(results);
})
.catch((error) => {
  // error
  console.log(error);
});


// DELETE https://jsonplaceholder.typicode.com/posts/1 HTTP/1.1
const objDeletePayload = {
  id: 1, // This will be added to the URL
};

objPostSource.remove(objDeletePayload).then((results) => {
  // success
  console.log(results);
})
.catch((error) => {
  // error
  console.log(error);
});


// GET https://jsonplaceholder.typicode.com/posts/1 HTTP/1.1
const objGetSinglePayload = {
  id: 1, // This will be added to the URL
};

objPostSource.getById(objGetSinglePayload).then((results) => {
  // success
  console.log(results);
})
.catch((error) => {
  // error
  console.log(error);
});


// GET https://jsonplaceholder.typicode.com/posts/1/comments HTTP/1.1
const objGetCommentsPayload = {
  id: 1, // This will be added to the URL
};

objPostSource.getPostComments(objGetCommentsPayload).then((results) => {
  // success
  console.log(results);
})
.catch((error) => {
  // error
  console.log(error);
});
