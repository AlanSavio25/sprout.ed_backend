

const maxRow = 10;
const maxCol = 15;

function classList(classes) {
  return Object
    .entries(classes)
    .filter(entry => entry[1])
    .map(entry => entry[0])
    .join(' ');
}

function indexToGrid(index){
  var row = Math.floor(index / maxCol);
  var col = index - row*maxCol;
  console.log(`${row},${col} <== ${index}`)
  return [row,col];
}

function gridToIndex(row,col){
  var index = row * maxCol + col;
  console.log(`${row},${col} ==> ${index}`)
  if (row < 0 || col < 0|| row >= maxRow|| col >= maxCol){
    return -1;
  }
  return index;
}


class Board extends React.Component {

  renderPlot(i) {

    var icon = this.state.icons[i];
    var plantable = this.state.plantable[i];
    var mode = this.state.mode;

    if (mode == "admin"){
      if (plantable){
        icon = '➕';
      }
      if (this.state.actionArray.has(i)){
        icon = 'ℹ️';
      }
    } else if (mode == "user"){
      plantable = true; //disables background override
      if (this.state.actionArray.has(i)){
        icon = 'ℹ️';
      }
    } else if (mode == "water"){
      if (this.state.actionArray.has(i)){
        icon = '💧';
      }
    }



    var liClasses = classList({
      'plot': true,
      'plantable': plantable
    });


    return (
      <button className={liClasses} onClick={() => this.handleClick(i)}>
      {icon}
      </button>
    );
  }



  constructor(props) {
    super(props);
    this.state = {
      icons: Array(maxCol*maxRow).fill(null),
      plantable: Array(maxCol*maxRow).fill(true),
      mode: "user",
      output: "",
      actionArray: new Set()
    };

    for (var key in plotsJson['plants']){
      var plot = plotsJson['plants'][key]['plot']
      var icon = plotsJson['plants'][key]['plantType']
      this.state.icons[plot] = icon;
      this.markUnPlantable(plot,plotsJson['plants'][key]['size']);
    }


  }



  handleClick(i) {
    const icons = this.state.icons.slice();
    var actionArray = this.state.actionArray;

    if (this.state.mode == "water" && this.state.icons[i]){
      //icons[i] = '💧';

      if (this.state.actionArray.has(i)){
        actionArray.delete(i);
      } else {
        actionArray.add(i);
      }
      console.log(actionArray);
    }

    if (this.state.mode != "water" && this.state.icons[i]){
      if (this.state.actionArray.has(i)){
        actionArray = new Set();
      } else {
        actionArray = new Set();
        actionArray.add(i);
      }
    }

    if (this.state.mode == "admin" && this.state.plantable[i]){
      icons[i] = '👨‍🌾';
      console.log(document.getElementById('size').value);
      this.markUnPlantable(i,parseInt(document.getElementById('size').value));
    }


    this.setState({
      icons: icons,
      output: `Clicked at ${i} ==> ${indexToGrid(i)}`,
      actionArray: actionArray
    });
  }

actionSelected(){
  console.log(Array.from(this.state.actionArray).join(' '))

  //this.state.output = actionArray;
    this.setState({
      output: Array.from(this.state.actionArray).map(indexToGrid).join(' & '),
      actionArray: new Set()
    })
}



markUnPlantable(centre,radius){

  var [row,col] = indexToGrid(centre);

  for (var i = row - radius; i <= row + radius; i++){
    for (var j = col - radius; j<= col + radius; j++) {
      this.state.plantable[gridToIndex(i,j)] = false;
    }
  }
}


changeMode(){

  this.setState({
    mode: document.getElementById('mode').value,
    actionArray: new Set()
  })
}

render(){
    const workspace = "Appleton 3";
    const rows = [];

    for (var y = 0; y<maxRow;y++){
      const row = [];
      for (var x = 0;x <maxCol; x++) {
        row.push(this.renderPlot(y*maxCol + x));
      }
      rows.push(  <div className="plant-row">{row}</div>)
    }

    var action = (this.state.mode == "admin")? "Remove" : "Water";

    return (
      <div>
        <div className="workspace">{workspace}</div>
        <select id="mode" onChange={() => this.changeMode()}>
          <option value="user">User</option>
          <option value="water">Water</option>
          <option value="admin">Admin</option>
        </select>
        <select id="size">
          <option value="0">r = 0</option>
          <option value="1">r = 1</option>
          <option value="2">r = 2</option>
          <option value="3">r = 3</option>
        </select>
        <div className="mode">View = {this.state.mode}</div>
        {rows}
        <button className="waterButton" onClick={() => this.actionSelected()}>{action}</button>
        <div className="message">Output = {this.state.output}</div>
      </div>
    );
}

}

ReactDOM.render(<Board />, document.getElementById('root'));
