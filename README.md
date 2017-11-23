# Axios Resources

It’s a module that creates a resource object that lets you interact with RESTful server-side data sources.

Based on Angular ngResources.

## Requirements
* Axios
* Lodash

## Examples

[Example File](./example.js)

```js

import AxiosResources from ‘axios-resources’;

let objConfig = {
  host: 'https://www.example/api'
};

let objAxiosResources = AxiosResources(objConfig);
let objSources = objAxiosResources.source('endpoint');


// GET https://www.example/api/endpoint?limit=100 HTTP/1.1
objSources.get({limit: 100})
  .then(response => response.json())
  .then((results) => {
    // success
    console.log(results);
  })
  .catch((error) => {
    console.log(error);
  });

```
