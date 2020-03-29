

const maxRow = 10;
const maxCol = 15;


//
//
//
//
//
//
//
//
//
//
// Yes this code is horrid af
//
//
//
//
//
//
//
//

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
  //console.log(`${row},${col} <== ${index}`)
  return [row,col];
}

function gridToIndex(row,col){
  var index = row * maxCol + col;
  //console.log(`${row},${col} ==> ${index}`)
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
      //console.log(images);
      //imageSrc = "/static/plantPics/p1.png";
      var imageSrc =  `\\static\\plant.jpg?d=${Date.now()}`;
      if (images){
        icons[key] =  <img src={imageSrc} alt="plot1 pic"></img>;
      } else {
        icons[key] = plotsJson['plots'][key]['plantIcon'];
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
    var plantZone = false;
    var blocked = false;

    if (mode == "admin"){
      if (plantable){
        //console.log(`${i} is plantable`)
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
    } else if (mode == "sow" && this.state.selectedType){
      if (this.state.hoverGrid == i){
        icon = plantDB['types'][this.state.selectedType]["sprite"];
        //console.log(icon)
      }
      //console.log(this.state.hoverArray.keys());
      if (this.state.hoverArray.includes(i)){
        //console.log(i);
        plantZone = true;
        blocked = !this.radiusPlantable();
      }
    }


    var liClasses = classList({
      'plot': true,
      'plantable': plantable,
      'plantZone': plantZone,
      'blocked': blocked
    });

    return (
      <div  className={liClasses}
            onClick={() => this.handleClick(i)}
            onMouseEnter={() => this.sowSelect(i)}
            onMouseLeave={() => this.clearTemp()}>
      {icon}
      </div>
    );
  }

  withinManhattan(sourceX,sourceY,target,type){
    var r = plantDB["types"][type]["spreadRadiusCM"]/this.state.gridToCM;
    var [targetX,targetY] = indexToGrid(target);

    return ((targetX <= sourceX + r) &&
            (targetX >= sourceX - r) &&
            (targetY <= sourceY + r) &&
            (targetY >= sourceY - r) )
  }

  withinEuclidean(centreX,centreY,target,type){
    var radius = plantDB['types'][type]["spreadRadiusCM"];
    var [targetX,targetY] = indexToGrid(target);

    var a = (targetX-centreX);
    var b = (targetY-centreY);
    var euclidean = Math.sqrt((a*a) + (b*b));

    return (euclidean*this.state.gridToCM < radius);
  }



  plotArray(centre, type){
    //console.log(centre)
    //console.log(type)
    if (!(type in plantDB['types'])){
      return [centre];
    }

    var plots = []

    var [centreX,centreY] = indexToGrid(centre);
    for (var i = 0;i < maxCol*maxRow; i++){
      if (this.withinEuclidean(centreX,centreY,i,type)) plots.push(i);
      //if (this.withinManhattan(centreX,centreY,i,type)) plots.push(i);
    }

    return plots;
  }





  renderSidebar(){

    var action = (this.state.mode == "admin")? "Remove" : "Water";

    if ((this.state.mode == "admin" || this.state.mode == "user") && this.state.actionArray.size == 1){
      var plot = this.state.actionArray.values().next().value
      if (plot in plotsJson['plots']){
        var waterdate = plotsJson['plots'][plot]['waterDate'];
        var name = plotsJson['plots'][plot]['plantName'];
        var imageSrc = `/static/plantPics/p${plot}.png`;
        if (plot == 99){
          var imageSrc =  `\\static\\plant.jpg?d=${Date.now()}`;
        }
        var image = <img src={imageSrc}  className="imageBox" alt="There is no image for this plant."></img>;
        //console.log(image);
      }
    }




    if (this.state.mode == "user" && this.state.actionArray.size == 1){
      return (
        <div>
          <h4>Overview ({this.state.mode} mode)</h4>
          <div className="message">This plant is called {name}</div>
          <br></br>
          <div className="message">This plant was last watered on {waterdate}</div>
          <br></br>
          {image}

        </div>
      );
    } else if (this.state.mode == "user"){
      return(
        <div>
          <h4>Overview ({this.state.mode} mode)</h4>
          <div className="message">Select a plant to view its information.</div>
        </div>
      );
    } else if (this.state.mode == "admin" && this.state.actionArray.size == 1){
      return (
        <div>
          <h4>Overview ({this.state.mode} mode)</h4>
          <div className="message">This plant is called {name}</div>
          <div className="message">Plot {plot}, co-ords ({indexToGrid(plot)[0]},{indexToGrid(plot)[1]})</div>
          <br></br>
          <div className="message">This plant was last watered on {waterdate}</div>
          <br></br>
          {image}
          <br></br>
          <br></br>
          <a className="button" id="view_image_button" onClick={() => alert("I do nothing")}>Rename {name}?</a>

          <br></br>
          <br></br>
          <a className="button" id="removePlant" onClick={() => this.removePlant(plot)}>Remove {name}?</a>



        </div>);
    } else if (this.state.mode == "admin"){

      return (
        <div>
          <h4>Overview ({this.state.mode} mode)</h4>
          <div className="message">Select a plant to view its information.</div>
          <br></br>
          <div className="message">Select a cross or click below to enter sow mode and add a new plant.</div>
          <br></br>
          <div className="message">Click below to water individual plants in watering mode.</div>
          <br></br>
          <a className="button" onClick={() => this.changeMode("sow")}>Sow mode</a>
          <br></br>
          <br></br>
          <a className="button" onClick={() => this.changeMode("water")}>Water mode</a>
        </div>
      );

    } else if (this.state.mode == "sow"){
      var plants = [];
      for (var key in plantDB['types']){
        plants.push(this.renderPlant(key));
      }
      return (
        <div>
          <h4>Overview ({this.state.mode} mode)</h4>
          <div className="plantSelector">
            {plants}
          </div>
          <a className="button" onClick={() => this.changeMode("admin")}>Exit</a>
        </div>
      )

    } else if (this.state.mode == "water"){
      return(
        <div>
          <h4>Overview ({this.state.mode} mode)</h4>
          <div className="message">Select one or more plants and then click below to water them now.</div>
          <br></br>
          <div className="message">{this.state.actionArray.size} plants currently selected for watering.</div>
          <br></br>
          <a className="button" onClick={() => this.actionSelected()}>{action} now</a>
          <br></br>
          <br></br>
          <a className="button" onClick={() => this.changeMode("admin")}>Exit</a>
        </div>
      )
    }

  }

  renderPlant(type){
    var liClasses = classList({
      'plant-row': true,
      'selected': (type==this.state.selectedType)
    });

    return (
      <div className={liClasses} onClick={() => this.selectType(type)}>
        <div className="sprite">{plantDB['types'][type]['sprite']}</div>
        <div className="details">
          <div className="typeName">{type}</div>
          <div className="description">{plantDB['types'][type]['description']}</div>
          <div className="description">Plant spread = {plantDB['types'][type]['spreadRadiusCM']}cm</div>
        </div>
      </div>
    );
  }

  removePlant(plot){
    //
    // this.setState({
    //   actionArray: new Set(),
    //   plantable: Array(maxCol*maxRow).fill(true)
    // });
    //
    // if (plot in plotsJson['plots']){
    //   console.log(plotsJson['plots'])
    //   delete plotsJson['plots'][plot];
    //   console.log(plotsJson['plots'])
    // };
    //
    // this.setupFromJson();

    fetch(`./removePlot?plot=${plot}`);
    window.location.reload(true);
  }

  addPlant(plot,type){
    var [x,y] = indexToGrid(plot);
    fetch(`./addPlant?plot=${plot}&type=${type}&x=${x}&y=${y}`)
  }

  selectType(type){
    this.setState({
      selectedType: type
    });
  }

  sowSelect(grid){
    this.setState({
      hoverGrid: grid,
      //output: `hovered at ${grid}`
      hoverArray: this.plotArray(grid,this.state.selectedType)
    });

  };

  clearTemp(){
    this.setState({
      hoverGrid: -100,
      hoverArray: []
    });
  }



  constructor(props) {
    super(props);
    this.state = {
      icons: Array(maxCol*maxRow).fill(null),
      plantable: Array(maxCol*maxRow).fill(true),
      mode: pageMode,
      output: "",
      actionArray: new Set(),
      selectedType: "",
      hoverGrid: -100,
      hoverArray: [],
      gridToCM: 7.0 //2.5
    };

    this.sideBar=  React.createRef();

    this.setupFromJson();


  }

  setupFromJson(){
    console.log("Setting up")
    console.log(plotsJson['plots'])
    console.log("======")
    for (var plot in plotsJson['plots']){
      //var icon = plotsJson['plots'][plot]['plantIcon'];
      var plantType = plotsJson['plots'][plot]['plantType']
      if (plantType in plantDB['types']){
        var icon = plantDB['types'][plantType]['sprite'];

      } else {
        var icon = plantDB['']

      }
      this.state.icons[plot] = icon;
      //this.state.icons[plot] =  <img src="/static/plantPics/p1.png" alt="plot1 pic"></img>;
      //console.log(this.plotArray(plot,plotsJson['plots'][plot]['plantType']));
      //console.log(`marking with ${plot} and ${plotsJson['plots'][plot]['plantType']}`);
      this.markUnPlantable(this.plotArray(plot,plotsJson['plots'][plot]['plantType']));
    }
    console.log("SetupfromjsonBottom")
    console.log(this.state.icons);
    console.log(this.state.plantable);
    console.log("======")

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
      this.changeMode("sow");
    }

    if (this.state.mode == "sow" && this.state.selectedType){
      if (this.state.plantable[i] && this.radiusPlantable()){
        icons[i] = plantDB['types'][this.state.selectedType]["sprite"];
        this.markUnPlantable(this.state.hoverArray);
        this.addPlant(i,this.state.selectedType)
      }
    }


    this.setState({
      icons: icons,
      output: `Clicked at ${i} ==> ${indexToGrid(i)}`,
      actionArray: actionArray
    });
  }

  radiusPlantable(){
    var plantable = true;
    this.state.hoverArray.forEach((item, i) => {
      plantable = plantable && this.state.plantable[item];
    });

    return plantable;
  }

  actionSelected(){

    //this.state.output = actionArray;
    this.setState({
      output: Array.from(this.state.actionArray).map(indexToGrid).join(' & '),
      actionArray: new Set()
    })
  }



  markUnPlantable(array){
    const plantable = this.state.plantable.slice();

    //var [row,col] = indexToGrid(centre);

    // array.forEach((item, i) => {
    //
    //   plantable[item] = false;
    // })

    for (var i in array){
      plantable[array[i]] = false;
    }

    this.state.plantable = plantable;

    // this.setState({
    //   plantable: plantable
    // });
    // console.log(array)
  }


  changeMode(mode){

    // <select id="mode" onChange={() => this.changeMode()}>
    //   <option value="user">User</option>
    //   <option value="water">Water</option>
    //   <option value="admin">Admin</option>
    // </select>

    this.setState({
      mode: mode,
      actionArray: new Set(),
      selectedType: ""
    })
  }

  render(){
    const workspace = "Appleton 3";
    const rows = [];
    console.log("RENDER")
    console.log(this.state.plantable)
    console.log("=====")

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
      </div>
    );
  }


}


ReactDOM.render(<Board />, document.getElementById('root'));
