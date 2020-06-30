import ReactDOM from "react-dom";
import React from "react";
import { geoEqualEarth, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import ReactTooltip from "react-tooltip";
import { cities } from "./cities";
import axios from "axios";
import CircularProgress from "@material-ui/core/CircularProgress";
const projection = geoEqualEarth()
  .scale(160)
  .translate([800 / 2, 450 / 2]);

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cases: 0,
      worldCases: "",
      geographies: [],
      loading: true,
      todayCases: 0
    };
  }
  handleCountryClick = (e, countryIndex) => {
    //console.log("Clicked on country: ", geographies[countryIndex])
    console.log(this.state.geographies[countryIndex].properties.name);
  };

  handleMarkerClick = i => {
    console.log("Marker: ", cities[i]);
  };

  getCases = country => {
    for (let i in this.state.worldCases) {
      if (this.state.worldCases[i].country === country) {
        //console.log(this.state.worldCases[i].cases);
        this.setState({
          cases: this.state.worldCases[i].cases,
          todayCases: this.state.worldCases[i].todayCases
        });
      } else if (country === "United States of America") {
        if (this.state.worldCases[i].country === "USA") {
          this.setState({
            cases: this.state.worldCases[i].cases,
            todayCases: this.state.worldCases[i].todayCases
          });
        }
      }
    }
  };
  componentDidMount() {
    fetch("/countries-50m.json").then(response => {
      if (response.status !== 200) {
        console.log(`There was a problem: ${response.status}`);
        return;
      }
      response.json().then(worlddata => {
        this.setState({
          geographies: feature(worlddata, worlddata.objects.countries).features
        });
        axios
          .get("https://corona.lmao.ninja/v2/countries")
          .then(res => {
            this.setState({ worldCases: res.data });
            this.setState({ loading: false });
          })
          .catch(ex => {
            console.log(ex);
          });
      });
    });
    ///

    ///
  }
  render() {
    if (this.state.loading) {
      return (
        <div style={{ textAlign: "center", marginTop: "20%" }}>
          <CircularProgress />
        </div>
      );
    }
    return (
      <div>
        <svg width={800} height={450} viewBox="0 0 800 450">
          <g className="countries">
            {this.state.geographies.map((d, i) => (
              <path
                key={`path-${i}`}
                d={geoPath().projection(projection)(d)}
                className="country"
                fill={`rgba(38,50,56,${(1 / this.state.geographies.length) *
                  i})`}
                stroke="#FFFFFF"
                strokeWidth={0.7}
                onClick={e => this.handleCountryClick(e, i)}
                onMouseOver={e => {
                  e.target.style.fill = "red";
                  this.getCases(this.state.geographies[i].properties.name);
                  //this.setState({ tooltip: true });
                  //console.log(this.state.cases);
                }}
                onMouseOut={e => {
                  e.target.style.fill = `rgba(38,50,56,${(1 /
                    this.state.geographies.length) *
                    i})`;
                  //this.setState({ tooltip: false });
                }}
              >
                (
                <title>
                  {this.state.geographies[i].properties.name +
                    "\ncases:" +
                    this.state.cases +
                    "\ntoday cases:" +
                    this.state.todayCases}
                </title>
                )
              </path>
            ))}
          </g>
          <g className="markers" data-tip="djjf">
            {cities.map((city, i) => (
              <circle
                key={`marker-${i}`}
                cx={projection(city.coordinates)[0]}
                cy={projection(city.coordinates)[1]}
                r={city.population / 3000000}
                fill="#E91E63"
                stroke="#FFFFFF"
                className="marker"
                onClick={() => this.handleMarkerClick(i)}
              />
            ))}
          </g>
          <ReactTooltip />
        </svg>
      </div>
    );
  }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
