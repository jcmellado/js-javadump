**js-javadump** is a JavaScript library for reading .class Java files.

### How to use? ###

Three steps are required:

**1)** Retrieve your `.class` file from the web, as usual:

```
function retrieve(url){
  var request = new XMLHttpRequest();
  request.open("GET", url, false);
  request.overrideMimeType("text/plain; charset=x-user-defined");
  request.send();
  if ( (200 !== request.status) && (0 !== request.status) ){
    throw new Error(request.status + " Retrieving " + url); 
  }
  return request;
};

var filename = "<your .class filename url here>";

var file = retrieve(filename).responseText;
```

**2)** Create a `JD.Stream` object from the retrieved file:

```
var stream = new JD.Stream(file);
```

**3)** Create a `JD.ClassFile` object from the stream:

```
var classFile = new JD.ClassFile(stream);
```

### What you get? ###

One `JD.ClassFile` object having all the .class file components according current specification JSR-202.