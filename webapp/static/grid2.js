
function Plot(props) {
  return (
    <button className="plot" onClick={props.onClick}>
    {props.value}
    </button>
  );
}

class Board extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      plants: Array(9).fill(null),
    };
  }

  handleClick(i) {
    const plants = this.state.plants.slice();
    plants[i] = '🌻';
    this.setState({
      plants: plants,
    });
  }

  renderPlot(i) {
    return (
      <Plot
        value={this.state.plants[i]}
        onClick={() => this.handleClick(i)}
      />
    );
  }

render(){
    const workspace = "Appleton 3";
    const rows = [];


    const maxRow = 10;
    const maxCol = 15;
    for (var y = 0; y<maxRow;y++){

      const row = [];
      for (var x = 0;x <maxCol; x++) {
        row.push(this.renderPlot(y*maxCol + x + 1));
      }

      rows.push(  <div className="plant-row">{row}</div>)
    }


    return (
      <div>
        <div className="workspace">{workspace}</div>
        {rows}
      </div>
    );
}

}

ReactDOM.render(<Board />, document.getElementById('root'));
