
//Helper stuff
function cart_prod(X, Y) {
    var out = [];
    for (var i in X) for (var j in Y) out.push([X[i], Y[j]]);
    return out;                     
}

function range(start, stop, step){
  var a=[], b=start;
  while(b<=stop){a.push(b);b+=step;}
  return a;
};

//Transformations and patterns:

//TRANS.transformation(State->State)
//TRANS.mapping([State])([Indexes] -> [Indexes])


TRANS = function(){
  this.transformation = function(state){ return state; } //defaults to identity
  this.mapping = function(state){ 
    return function(indexes){ 
      return indexes; 
    } 
  };//Again, to identity

  var outer = this;
  this.compose = function(inner){
    result = new TRANS();
    result.match = function(state){return true;}

    result.transformation = function(state){return outer.transformation(inner.transformation(state)); }
    result.mapping = function(state){
      return function(indexes){ 
       var innerMap = inner.mapping(state);
       var outerMap = outer.mapping(inner.transformation(state));
       //console.log("starting mapping: " + (indexes).toString());
       //console.log("Innner Map is" + innerMap(indexes).toString());
       // console.log((indexes).toString());
        //console.log(outerMap(indexes).toString());
       // console.log(outerMap(innerMap(indexes)).toString());
       //console.log("Result Map is" + outerMap(innerMap(indexes)).toString());

        return outerMap(innerMap(indexes));
      }
    }
    return result;
  }
}

pattern_id = function(location){  //Takes a location, and returns the member of TRANS that is indexed to that location
  var id = new TRANS();
  return id;  

} 

pattern_commutePlus = function(location){ // for now, this knows the indexes
    var plusTRANS= new TRANS();

    plusTRANS.match = function(state){
      substate = state.substate(location);
      return(substate.match(new stateFromString('a+b')));
    }
    plusTRANS.mapping = function(state){
      return function(indexes){
        var substate = state.substate[location];
        var newIndexes = [];

        if(plusTRANS.match(state)){
          var indexes2 = mObj=JSON.parse(JSON.stringify(indexes));
          indexes2 = indexes2.map(function(item) { 
            if(item[0]==location[0]+0 || item[0]==location[0]+2){
              if(item[0] == location[0]+0) { item[0] =location[0]+2;}
              else if(item[0] ==location[0]+2){ item[0]=location[0]+0;}
            }
            if(item[1]==location[0]+0 || item[1]==location[0]+2){
              if(item[1] == location[0]+0) { item[1] =location[0]+2;}
              else if(item[1] ==location[0]+2){ item[1]=location[0]+0;}
            }
            return item;
          }
           
          );
          // console.log("indexes from inside a commute: " + location.toString() + ": " + indexes.toString() )

          //console.log("    results in: " + indexes2.toString());

          return indexes2;
          
        } else {
          //console.log("time bomb");
          return indexes;
        }
      }
    }

    plusTRANS.transformation = function(state){
      if(plusTRANS.match(state)){
        indexes = (plusTRANS.mapping(state))(range(0, state.length-1, 1).map(function(x){return [x];}));
        result = "";
        for(i =0 ; i < indexes.length; i++){
           result = result + state.substate(indexes[i]).string;
        }
        return new stateFromString(result);
      } else {
        return state;
      }
    }


    return plusTRANS;
  
}




pattern_executePlus = function(location){ // for now, this knows the indexes
    var exPlusTRANS= new TRANS();

    exPlusTRANS.match = function(state){
      substate = state.substate(location);
      return(substate.match(new stateFromString('A+B')));
    }
    exPlusTRANS.mapping = function(state){
      return function(indexes){
        substate = state.substate[location];
        if(exPlusTRANS.match(state)){
          var indexes2 = mObj=JSON.parse(JSON.stringify(indexes));
          indexes2 = indexes2.map(function(item) { 
            //Everything in location[0] + 1, +2 maps to 0.
            if(item[0]==location[0]+1){
                  item[0] = item[0]-1;
            } else if(item[0] >= location[0]+2){ 
              item[0]=item[0]-2;
            }
  
             if(item[1]==location[0]+1 ){
                  item[1] = item[1]-1;
            } else if(item[1] >= location[0]+2){ 
              item[1]=item[1]-2;
            }
            return item;
          });
          console.log(indexes2.toString());
          return indexes2;
        } else {
          return indexes;
        }
      }
    }

    exPlusTRANS.transformation = function(state){
      if(exPlusTRANS.match(state)){
        indexes = (range(0, state.length-1, 1).map(function(x){return [x];}));
        result = "";
        for(i =0 ; i < indexes.length; i++){
           if(i==location[[0]]){
              result = result + (parseInt(state.substate([location[0]]).string) + 
                                  parseInt(state.substate([location[0]+2]).string)).toString();
           } else  if(i==location[0]+1 | i==location[0]+2){
              //Ignore these. The've gone away.

           } else {
              result = result + state.substate(indexes[i]).string;
           }
        }

        return new stateFromString(result);
      } else {
        return state;
      }
    }


    return exPlusTRANS;
  
}







// String based states, just for concreteness.  The 
stateFromString = function(stateString){ // creates a new state object, which can yield and accept indexes...right now, indexes are just elements.  
  this.string = stateString;
  //As a convenience, I'll add a "atomic indexes" into the miminal elements
  this.atomicIndexes = range(0, stateString.length , 1);
  for(var i=0; i<stateString.length; i++){
    this.atomicIndexes[i] = i;
  }
  this.indexes = cart_prod(this.atomicIndexes, this.atomicIndexes).filter(function(x){return x[0] <= x[1];});
  this.length = this.string.length;
  this.substate = function(index) {
    if(index.length==0){
      return new stateFromString("");
    } else if(index.length==1){
      return new stateFromString(this.string.substring(index[0], index[0]+1));
    } else {
      return new stateFromString(this.string.substring(index[0], index[1]+1));
    }
  }


  this.match = function(other){
   if(this.length != other.length){ return false};
    bindings = [];
    for(var i=0; i<this.length; i++){
      otherChar = other.string[i];
      thisChar = this.string[i];
      if(otherChar.match(/[+\*\/-]/)){ //Result must be identical
        if(otherChar != thisChar) return false;
      } else if(otherChar.match(/[0-9]/)){ //Result must be identical
        if(otherChar != thisChar) return false;
      } else if(otherChar.match(/[a-z]/)){ //Result must be a number or letter
          //AND result must be consistent with previous bindings
        if(!thisChar.match(/[a-z0-9]/)) { return false;}
        if(bindings[otherChar]){
          if(bindings[otherChar] != thisChar) return false;
        } else {
          bindings[otherChar] = thisChar;
        }

      } else if(otherChar.match(/[A-Z]/)){ //Result must be a number, specifically
          //AND result must be consistent with previous bindings
        if(!thisChar.match(/[0-9]/)) { return false;}
        if(bindings[otherChar]){
          if(bindings[otherChar] != thisChar) return false;
        } else {
          bindings[otherChar] = thisChar;
        }


    }
    return true;
  }


  
 

return this;

}

}




 var transformation1 = pattern_commutePlus([0, 2]);
  var transformation2 = pattern_commutePlus([2, 4]);
  var transformation3 = pattern_commutePlus([4, 6]);
  var transformationAdd1 = pattern_executePlus([0, 2]);
  var transformationAdd2 = pattern_executePlus([2, 4]);
  var transformation = (transformation1.compose(transformation2).compose(transformation1)); //transformation2.
n = new stateFromString("1+2+3+4");






