
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
