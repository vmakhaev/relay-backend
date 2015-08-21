# Relay-Backend

GraphQL server, that generates schemas based on incoming queries.
Base mutations works too.
The idea is to speed up development of Relay apps.

## How to use it

```
npm install
npm start
```

Now it's running on 8080 port, add to your Relay app:
```
Relay.injectNetworkLayer(
  new Relay.DefaultNetworkLayer('http://localhost:8080?appid=12341234')
);
```

Where appid - just some random symbols to distinguish your apps

Now play with it!

## Tests

It was tested on [Relay examples](https://github.com/facebook/relay/tree/master/examples)

## MIT License
Copyright (c) 2015 by Vladimir Makhaev

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
