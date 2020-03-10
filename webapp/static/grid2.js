

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

var images = false;
class Board extends React.Component {

  toggleImages(){

    const icons = this.state.icons.slice();

    for (var key in plotsJson['plots']){
      console.log(images);
      //imageSrc = "/static/plantPics/p1.png";
      var imageSrc =  `\\static\\plant.jpg?d=${Date.now()}`;
      if (images){
        icons[key] =  <img src={imageSrc} alt="plot1 pic"></img>;
      } else {
        icons[key] = plotsJson['plots'][key]['plantType'];
      }
    }
    images = !images;


    this.setState({
      icons: icons
    });
  }

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
      <div  className={liClasses}  onClick={() => this.handleClick(i)}>
      {icon}
      </div>
    );
  }

  renderSidebar(){

    if ((this.state.mode == "admin" || this.state.mode == "user") && this.state.actionArray.size == 1){
      var plot = this.state.actionArray.values().next().value
      if (plot in plotsJson['plots']){
        var waterdate = plotsJson['plots'][plot]['waterDate'];
        var name = plotsJson['plots'][plot]['plantName'];
        var imageSrc = `/static/plantPics/p${plot}.png`;
        if (plot == 99){
          var imageSrc =  `\\static\\plant.jpg?d=${Date.now()}`;
        }
        var image = <img src={imageSrc}  className="imageBox" alt="plotPlantPhoto"></img>;
        console.log(image);
      }
    }

    var action = (this.state.mode == "admin")? "Remove" : "Water";



    if (this.state.mode == "user"){
      return (
        <div>
          <h4>Overview ({this.state.mode})</h4>
          <div className="message">This plant is called {name}</div>
          <div className="message">This plant was last watered on {waterdate}</div>
        </div>
      );
    } else if (this.state.mode == "admin"){
      return (
        <div>
          <h4>Overview ({this.state.mode})</h4>
          <button className="waterButton" onClick={() => this.actionSelected()}>{action}</button>
          <div className="message">This plant was last watered on {waterdate}</div>
          <div className="message">This plant is called {name}</div>
          <div className="message">Plot {plot}, co-ords ({indexToGrid(plot)[0]},{indexToGrid(plot)[1]})</div>

          {image}
          <a className="button" id="view_image_button" onClick={() => this.removePlant(plot)}>Remove {name}?</a>
        </div>
      );

    } else if (this.state.mode == "sow"){
      var plants = [];
      for (var key in plantDB['types']){
        plants.push(this.renderPlant(key));
      }
      return (
        <div>
          <h4>Overview ({this.state.mode})</h4>
          {plants}
          <a className="button" onClick={() => this.setState({mode: "admin"})}>Cancel</a>
        </div>
      )

    }

  }

  renderPlant(type){
    return (
      <div className="plant-row">
        <div className="sprite">{plantDB['types'][type]['sprite']}</div>
        <div className="name">{type}</div>
        <div className="">{plantDB['types'][type]['description']}</div>

      </div>
    );
  }



  constructor(props) {
    super(props);
    this.state = {
      icons: Array(maxCol*maxRow).fill(null),
      plantable: Array(maxCol*maxRow).fill(true),
      mode: pageMode,
      output: "",
      actionArray: new Set()
    };

    this.sideBar=  React.createRef();


    for (var key in plotsJson['plots']){
      var plot = key;
      var icon = plotsJson['plots'][key]['plantType'];
      this.state.icons[plot] = icon;
      //this.state.icons[plot] =  <img src="/static/plantPics/p1.png" alt="plot1 pic"></img>;
      this.markUnPlantable(plot,plotsJson['plots'][key]['size']);
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
      //icons[i] = '👨‍🌾';
      //console.log(document.getElementById('size').value);
      //this.markUnPlantable(i,1);
      this.setState({
        mode: "sow"
      });
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

    // <select id="mode" onChange={() => this.changeMode()}>
    //   <option value="user">User</option>
    //   <option value="water">Water</option>
    //   <option value="admin">Admin</option>
    // </select>

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
      rows.push(  <div className="plot-row">{row}</div>)
    }


    return (
      <div>
        <div className="plant_map">
          {rows}

        </div>
        <div className="info_box">
          {this.renderSidebar()}
        </div>
        <div className="message">Debug output = {this.state.output}</div>
      </div>
    );
  }


}


ReactDOM.render(<Board />, document.getElementById('root'));
