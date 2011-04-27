
JD.ConstantPoolTag = {
  CLASS: 7,
  FIELDREF: 9,
  METHODREF: 10,
  INTERFACE_METHODREF: 11,
  STRING: 8,
  INTEGER: 3,
  FLOAT: 4,
  LONG: 5,
  DOUBLE: 6,
  NAME_AND_TYPE: 12,
  UTF8: 1
};

JD.AccessFlag = {
  PUBLIC: 0x0001,
  PRIVATE: 0x0002,
  PROTECTED: 0x0004,
  STATIC: 0x0008,
  FINAL: 0x0010,
  SUPER: 0x0020,
  SYNCHRONIZED: 0x0020,
  VOLATILE: 0x0040,
  BRIDGE: 0x0040,
  TRANSIENT: 0x0080,
  VARARGS: 0x0080,
  NATIVE: 0x0100,
  INTERFACE: 0x0200,
  ABSTRACT: 0x0400,
  STRICT: 0x0800,
  SYNTHETIC: 0x1000,
  ANNOTATION: 0x2000,
  ENUM: 0x4000
};

JD.ClassFile = function(stream){
  this.magic = stream.readU4();
  this.minorVersion = stream.readU2();
  this.majorVersion = stream.readU2();
  this.constantPoolCount = stream.readU2();
  this.constantPool = this.readConstantPool(stream, this.constantPoolCount - 1);
  this.accessFlags = stream.readU2();
  this.thisClass = stream.readU2();
  this.superClass = stream.readU2();
  this.interfacesCount = stream.readU2();
  this.interfaces = this.readInterfaces(stream, this.interfacesCount);
  this.fieldsCount = stream.readU2();
  this.fields = this.readFields(stream, this.fieldsCount);
  this.methodsCount = stream.readU2();
  this.methods = this.readMethods(stream, this.methodsCount);
  this.attributesCount = stream.readU2();
  this.attributes = this.readAttributes(stream, this.attributesCount);
};

JD.ClassFile.prototype.readConstantPool = function(stream, count){
  var pool = [undefined], tag;

  while(count --){
    tag = stream.readU1();

    switch(tag){
      case JD.ConstantPoolTag.CLASS:
        pool.push( new JD.ClassInfo(stream, tag) );
        break;
      case JD.ConstantPoolTag.FIELDREF:
        pool.push( new JD.FieldrefInfo(stream, tag) );
        break;
      case JD.ConstantPoolTag.METHODREF:
        pool.push( new JD.MethodrefInfo(stream, tag) );
        break;
      case JD.ConstantPoolTag.INTERFACE_METHODREF:
        pool.push( new JD.InterfaceMethodrefInfo(stream, tag) );
        break;
      case JD.ConstantPoolTag.STRING:
        pool.push( new JD.StringInfo(stream, tag) );
        break;
      case JD.ConstantPoolTag.INTEGER:
        pool.push( new JD.IntegerInfo(stream, tag) );
        break;
      case JD.ConstantPoolTag.FLOAT:
        pool.push( new JD.FloatInfo(stream, tag) );
        break;
      case JD.ConstantPoolTag.LONG:
        pool.push( new JD.LongInfo(stream, tag) );
        count --;
        pool.push(undefined);
        break;
      case JD.ConstantPoolTag.DOUBLE:
        pool.push( new JD.DoubleInfo(stream, tag) );
        count --;
        pool.push(undefined);
        break;
      case JD.ConstantPoolTag.NAME_AND_TYPE:
        pool.push( new JD.NameAndTypeInfo(stream, tag) );
        break;
      case JD.ConstantPoolTag.UTF8:
        pool.push( new JD.Utf8Info(stream, tag) );
        break;
    }
  }

  return pool;
};

JD.ClassFile.prototype.readInterfaces = function(stream, count){
  var interfaces = [];
  while(count --){
    interfaces.push( new JD.ClassInfo(stream, JD.ConstantPoolTag.CLASS) );
  }
  return interfaces;
};

JD.ClassFile.prototype.readFields = function(stream, count){
  var fields = [];
  while(count --){
    fields.push( new JD.FieldInfo(this, stream) );
  }
  return fields;
};

JD.ClassFile.prototype.readMethods = function(stream, count){
  var methods = [];
  while(count --){
    methods.push( new JD.MethodInfo(this, stream) );
  }
  return methods;
};

JD.ClassFile.prototype.readAttributes = function(stream, count){
  var attributes = [], nameIndex, length;
  
  while(count --){
    nameIndex = stream.readU2();
    length = stream.readU4();

    switch( this.constantPool[nameIndex].stringValue ){
      case "ConstantValue":
        attributes.push( new JD.ConstantValueAttribute(stream, nameIndex, length) );
        break;
      case "Code":
        attributes.push( new JD.CodeAttribute(this, stream, nameIndex, length) );
        break;
      case "StackMapTable":
        attributes.push( new JD.StackMapTableAttribute(stream, nameIndex, length) );
        break;
      case "Exceptions":
        attributes.push( new JD.ExceptionsAttribute(stream, nameIndex, length) );
        break;
      case "InnerClasses":
        attributes.push( new JD.InnerClassesAttribute(stream, nameIndex, length) );
        break;
      case "EnclosingMethod":
        attributes.push( new JD.EnclosingMethodAttribute(stream, nameIndex, length) );
        break;
      case "Synthetic":
        attributes.push( new JD.SyntheticAttribute(stream, nameIndex, length) );
        break;
      case "Signature":
        attributes.push( new JD.SignatureAttribute(stream, nameIndex, length) );
        break;
      case "SourceFile":
        attributes.push( new JD.SourceFileAttribute(stream, nameIndex, length) );
        break;
      case "SourceDebugExtension":
        attributes.push( new JD.SourceDebugExtensionAttribute(stream, nameIndex, length) );
        break;
      case "LineNumberTable":
        attributes.push( new JD.LineNumberTableAttribute(stream, nameIndex, length) );
        break;
      case "LocalVariableTable":
        attributes.push( new JD.LocalVariableTableAttribute(stream, nameIndex, length) );
        break;
      case "LocalVariableTypeTable":
        attributes.push( new JD.LocalVariableTypeTableAttribute(stream, nameIndex, length) );
        break;
      case "Deprecated":
        attributes.push( new JD.DeprecatedAttribute(stream, nameIndex, length) );
        break;
      case "RuntimeVisibleAnnotations":
        attributes.push( new JD.RuntimeVisibleAnnotationsAttribute(stream, nameIndex, length) );
        break;
      case "RuntimeInvisibleAnnotations":
        attributes.push( new JD.RuntimeInvisibleAnnotationsAttribute(stream, nameIndex, length) );
        break;
      case "RuntimeVisibleParameterAnnotations":
        attributes.push( new JD.RuntimeVisibleParameterAnnotationsAttribute(stream, nameIndex, length) );
        break;
      case "RuntimeInvisibleParameterAnnotations":
        attributes.push( new JD.RuntimeInvisibleParameterAnnotationsAttribute(stream, nameIndex, length) );
        break;
      case "AnnotationDefault":
        attributes.push( new JD.AnnotationDefaultAttribute(stream, nameIndex, length) );
        break;
      default:
        attributes.push( new JD.AttributeInfo(stream, nameIndex, length) );
        break;
    }
  }

  return attributes;
};

JD.ClassInfo = function(stream, tag){
  this.tag = tag;
  this.nameIndex = stream.readU2();
};

JD.FieldrefInfo = function(stream, tag){
  this.tag = tag;
  this.classIndex = stream.readU2();
  this.nameAndTypeIndex = stream.readU2();
};

JD.MethodrefInfo = function(stream, tag){
  this.tag = tag;
  this.classIndex = stream.readU2();
  this.nameAndTypeIndex = stream.readU2();
};

JD.InterfaceMethodrefInfo = function(stream, tag){
  this.tag = tag;
  this.classIndex = stream.readU2();
  this.nameAndTypeIndex = stream.readU2();
};

JD.StringInfo = function(stream, tag){
  this.tag = tag;
  this.stringIndex = stream.readU2();
};

JD.IntegerInfo = function(stream, tag){
  this.tag = tag;
  this.bytes = stream.readS4();
};

JD.FloatInfo = function(stream, tag){
  this.tag = tag;
  this.bytes = stream.readS4();
};

JD.LongInfo = function(stream, tag){
  this.tag = tag;
  this.highBytes = stream.readS4();
  this.lowBytes = stream.readS4();
};

JD.DoubleInfo = function(stream, tag){
  this.tag = tag;
  this.highBytes = stream.readS4();
  this.lowBytes = stream.readS4();
};

JD.NameAndTypeInfo = function(stream, tag){
  this.tag = tag;
  this.nameIndex = stream.readU2();
  this.descriptorIndex = stream.readU2();
};

JD.Utf8Info = function(stream, tag){
  this.tag = tag;
  this.length = stream.readU2();
  this.stringValue = stream.readString(this.length);
};

JD.FieldInfo = function(file, stream){
  this.accessFlags = stream.readU2();
  this.nameIndex = stream.readU2();
  this.descriptorIndex = stream.readU2();
  this.attributesCount = stream.readU2();
  this.attributes = file.readAttributes(stream, this.attributesCount);
};

JD.MethodInfo = function(file, stream){
  this.accessFlags = stream.readU2();
  this.nameIndex = stream.readU2();
  this.descriptorIndex = stream.readU2();
  this.attributesCount = stream.readU2();
  this.attributes = file.readAttributes(stream, this.attributesCount);
};

JD.AttributeInfo = function(stream, nameIndex, length){
  this.nameIndex = nameIndex;
  this.length = length;
  this.info = stream.readArrayU1(this.length);
};

JD.ConstantValueAttribute = function(stream, nameIndex, length){
  this.nameIndex = nameIndex;
  this.length = length;
  this.constantValueIndex = stream.readU2();
};

JD.CodeAttribute = function(file, stream, nameIndex, length){
  this.nameIndex = nameIndex;
  this.length = length;
  this.maxStack = stream.readU2();
  this.maxLocals = stream.readU2();
  this.codeLength = stream.readU4();
  this.code = stream.readArrayU1(this.codeLength);
  this.exceptionTableLength = stream.readU2();
  this.exceptionTable = this.readExceptionTable(stream, this.exceptionTableLength);
  this.attributesCount = stream.readU2();
  this.attributes = file.readAttributes(stream, this.attributesCount);
};

JD.CodeAttribute.prototype.readExceptionTable = function(stream, count){
  var table = [];
  while(count --){
    table.push( new JD.ExceptionTableEntry(stream) );
  }
  return table;
};

JD.ExceptionTableEntry = function(stream){
  this.startPc = stream.readU2();
  this.endPc = stream.readU2();
  this.handlerPc = stream.readU2();
  this.catchType = stream.readU2();
};

JD.StackMapTableAttribute = function(stream, nameIndex, length){
  this.nameIndex = nameIndex;
  this.length = length;
  this.numberOfEntries = stream.readU2();
  this.entries = this.readEntries(stream, this.numberOfEntries);
};

JD.StackMapTableAttribute.prototype.readEntries = function(stream, count){
  var entries = [];
  while(count --){
    entries.push( new JD.StackMapFrame(stream) );
  }
  return entries;
};

JD.StackMapFrame = function(stream){
  this.frameType = stream.readU1();
  
  //SAME_LOCALS_1_STACK_ITEM
  if (this.frameType >= 64 && this.frameType <= 127){
    this.stack = this.readVerificationTypeInfo(stream, 1);
  }
  //SAME_LOCALS_1_STACK_ITEM_EXTENDED
  if (this.frameType === 247){
    this.offsetDelta = stream.readU2();
    this.stack = this.readVerificationTypeInfo(stream, 1);
  }
  //CHOP
  if (this.frameType >= 248 && this.frameType <= 250){
    this.offsetDelta = stream.readU2();
  }
  //SAME_FRAME_EXTENDED
  if (this.frameType === 251){
    this.offsetDelta = stream.readU2();
  }
  //APPEND
  if (this.frameType >= 252 && this.frameType <= 254){
    this.offsetDelta = stream.readU2();
    this.locals = this.readVerificationTypeInfo(stream, this.frameType - 251);
  }
  //FULL_FRAME
  if (this.frameType === 255){
    this.offsetDelta = stream.readU2();
    this.numberOfLocals = stream.readU2();
    this.locals = this.readVerificationTypeInfo(stream, this.numberOfLocals);
    this.numberOfStackItems = stream.readU2();
    this.stack = this.readVerificationTypeInfo(stream, this.numberOfStackItems);
  }
};

JD.StackMapFrame.prototype.readVerificationTypeInfo = function(stream, count){
  var types = [];
  while(count --){
    types.push( new JD.VerificationTypeInfo(stream) );
  }
  return types;
};

JD.VerificationTypeInfo = function(stream){
  this.tag = stream.readU1();
  //ITEM_Object
  if (this.tag === 7){
    this.cpoolIndex = stream.readU2();
  }
  //ITEM_Uninitialized
  if (this.tag === 8){
    this.offset = stream.readU2();
  }
};

JD.ExceptionsAttribute = function(stream, nameIndex, length){
  this.nameIndex = nameIndex;
  this.length = length;
  this.numberOfExceptions = stream.readU2();
  this.exceptionIndexTable = stream.readArrayU2(this.numberOfExceptions);
};

JD.InnerClassesAttribute = function(stream, nameIndex, length){
  this.nameIndex = nameIndex;
  this.length = length;
  this.numberOfClasses = stream.readU2();
  this.classes = this.readClassesTable(stream, this.numberOfClasses);
};

JD.InnerClassesAttribute.prototype.readClassesTable = function(stream, count){
  var classes = [];
  while(count --){
    classes.push( new JD.ClassesTableEntry(stream) );
  }
  return classes;
};

JD.ClassesTableEntry = function(stream){
  this.innerClassInfoIndex = stream.readU2();
  this.outerClassInfoIndex = stream.readU2();
  this.innerNameIndex = stream.readU2();
  this.innerClassAccessFlags = stream.readU2();
};

JD.EnclosingMethodAttribute = function(stream, nameIndex, length){
  this.nameIndex = nameIndex;
  this.length = length;
  this.classIndex = stream.readU2();
  this.methodIndex = stream.readU2();
};

JD.SyntheticAttribute = function(stream, nameIndex, length){
  this.nameIndex = nameIndex;
  this.length = length;
};

JD.SignatureAttribute = function(stream, nameIndex, length){
  this.nameIndex = nameIndex;
  this.length = length;
  this.signatureIndex = stream.readU2();
};

JD.SourceFileAttribute = function(stream, nameIndex, length){
  this.nameIndex = nameIndex;
  this.length = length;
  this.sourcefileIndex = stream.readU2();
};

JD.SourceDebugExtensionAttribute = function(stream, nameIndex, length){
  this.nameIndex = nameIndex;
  this.length = length;
  this.debugExtension = stream.readArrayU1(this.length);
};

JD.LineNumberTableAttribute = function(stream, nameIndex, length){
  this.nameIndex = nameIndex;
  this.length = length;
  this.lineNumberTableLength = stream.readU2();
  this.lineNumberTable = this.readLineNumberTable(stream, this.lineNumberTableLength);
};

JD.LineNumberTableAttribute.prototype.readLineNumberTable = function(stream, count){
  var table = [];
  while(count --){
    table.push( new JD.LineNumberTableEntry(stream) );
  }
  return table;
};

JD.LineNumberTableEntry = function(stream){
  this.startPc = stream.readU2();
  this.lineNumber = stream.readU2();
};

JD.LocalVariableTableAttribute = function(stream, nameIndex, length){
  this.nameIndex = nameIndex;
  this.length = length;
  this.localVariableTableLength = stream.readU2();
  this.localVariableTable = this.readLocalVariableTable(stream, this.localVariableTableLength);
};

JD.LocalVariableTableAttribute.prototype.readLocalVariableTable = function(stream, count){
  var table = [];
  while(count --){
    table.push( new JD.LocalVariableTableEntry(stream) );
  }
  return table;
};

JD.LocalVariableTableEntry = function(stream){
  this.startPc = stream.readU2();
  this.length = stream.readU2();
  this.nameIndex = stream.readU2();
  this.descriptorIndex = stream.readU2();
  this.index = stream.readU2();
};

JD.LocalVariableTypeTableAttribute = function(stream, nameIndex, length){
  this.nameIndex = nameIndex;
  this.length = length;
  this.localVariableTypeTableLength = stream.readU2();
  this.localVariableTypeTable = this.readLocalVariableTypeTable(stream, this.localVariableTypeTableLength);
};

JD.LocalVariableTypeTableAttribute.prototype.readLocalVariableTypeTable = function(stream, count){
  var table = [];
  while(count --){
    table.push( new JD.LocalVariableTypeTableEntry(stream) );
  }
  return table;
};

JD.LocalVariableTypeTableEntry = function(stream){
  this.startPc = stream.readU2();
  this.length = stream.readU2();
  this.nameIndex = stream.readU2();
  this.signatureIndex = stream.readU2();
  this.index = stream.readU2();
};

JD.DeprecatedAttribute = function(stream, nameIndex, length){
  this.nameIndex = nameIndex;
  this.length = length;
};

JD.RuntimeVisibleAnnotationsAttribute = function(stream, nameIndex, length){
  this.nameIndex = nameIndex;
  this.length = length;
  this.numAnnotations = stream.readU2();
  this.annotations = this.readAnnotations(stream, this.numAnnotations);
};

JD.RuntimeVisibleAnnotationsAttribute.prototype.readAnnotations = function(stream, count){
  var annotations = [];
  while(count --){
    annotations.push( new JD.Annotation(stream) );
  }
  return annotations;
};

JD.Annotation = function(stream){
  this.typeIndex = stream.readU2();
  this.numElementValuePairs = stream.readU2();
  this.elementValuePairs = this.readElementValuePairs(stream, this.numElementValuePairs);
};

JD.Annotation.prototype.readElementValuePairs = function(stream, count){
  var pairs = [];
  while(count --){
    pairs.push( new JD.ElementValuePair(stream) );
  }
  return pairs;
};

JD.ElementValuePair = function(stream){
  this.elementNameIndex = stream.readU2();
  this.value = new JD.ElementValue(stream);
};

JD.ElementValue = function(stream){
  this.tag = stream.readString(1);
  
  if ("BCDFIJSZs".indexOf(this.tag) !== -1){
    this.constValueIndex = stream.readU2();
  }
  if ("e" === this.tag){
    this.typeNameIndex = stream.readU2();
    this.constNameIndex = stream.readU2();
  }
  if ("c" === this.tag){
    this.classInfoIndex = stream.readU2();
  }
  if ("@" === this.tag){
    this.annotationValue = new JD.Annotation(stream);
  }
  if ("[" === this.tag){
    this.numValues = stream.readU2();
    this.values = this.readValues(stream, this.numValues);
  }
};

JD.ElementValue.prototype.readValues = function(stream, count){
  var values = [];
  while(count --){
    values.push( new JD.ElementValue(stream) );
  }
  return values;
};

JD.RuntimeInvisibleAnnotationsAttribute = function(stream, nameIndex, length){
  this.nameIndex = nameIndex;
  this.length = length;
  this.numAnnotations = stream.readU2();
  this.annotationAnnotations = this.readAnnotations(stream, this.numAnnotations);
};

JD.RuntimeVisibleAnnotationsAttribute.prototype.readAnnotations = function(stream, count){
  var annotations = [];
  while(count --){
    annotations.push( new JD.Annotation(stream) );
  }
  return annotations;
};

JD.RuntimeVisibleParameterAnnotationsAttribute = function(stream, nameIndex, length){
  this.nameIndex = nameIndex;
  this.length = length;
  this.numParameters = stream.readU1();
  this.parameterAnnotations = this.readParameterAnnotations(stream, this.numParameters);
};

JD.RuntimeVisibleParameterAnnotationsAttribute.prototype.readParameterAnnotations = function(stream, count){
  var annotations = [];
  while(count --){
    annotations.push( new JD.ParameterAnnotation(stream) );
  }
  return annotations;
};

JD.ParameterAnnotation = function(stream){
  this.numAnnotations = stream.readU2();
  this.annotations = this.readAnnotations(stream, this.numAnnotations);
};

JD.ParameterAnnotation.prototype.readAnnotations = function(stream, count){
  var annotations = [];
  while(count --){
    annotations.push( new JD.Annotation(stream) );
  }
  return annotations;
};

JD.RuntimeInvisibleParameterAnnotationsAttribute = function(stream, nameIndex, length){
  this.nameIndex = nameIndex;
  this.length = length;
  this.numParameters = stream.readU1();
  this.parameterAnnotations = this.readParameterAnnotations(stream, this.numParameters);
};

JD.RuntimeInvisibleParameterAnnotationsAttribute.prototype.readParameterAnnotations = function(stream, count){
  var annotations = [];
  while(count --){
    annotations.push( new JD.ParameterAnnotation(stream) );
  }
  return annotations;
};

JD.AnnotationDefaultAttribute = function(stream, nameIndex, length){
  this.nameIndex = nameIndex;
  this.length = length;
  this.defaultValue = new JD.ElementValue(stream);
};
