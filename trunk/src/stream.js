/*
Copyright (c) 2011 Juan Mellado

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
*/

JD.Stream = function(data){
  this.data = data;
  this.offset = 0;
};

JD.Stream.prototype.readU1 = function(){
  return this.data.charCodeAt(this.offset ++) & 0xff;
};

JD.Stream.prototype.readU2 = function(){
  var u2 = this.readU1() << 8;
  return u2 | this.readU1();
};

JD.Stream.prototype.readU4 = function(){
  var u4 = this.readU2() * 65536;
  return u4 + this.readU2();
};

JD.Stream.prototype.readS4 = function(){
  var u4 = this.readU2() << 16;
  return u4 | this.readU2();
};

JD.Stream.prototype.readArrayU1 = function(len){
  var array = [];
  while(len --){
    array.push( this.readU1() );
  }
  return array;
};

JD.Stream.prototype.readArrayU2 = function(len){
  var array = [];
  while(len --){
    array.push( this.readU2() );
  }
  return array;
};

JD.Stream.prototype.readString = function(len){
  this.offset += len;

  return this.data.substr(this.offset - len, len);
};
