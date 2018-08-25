import React, { Component } from 'react';
import fetchJsonp from 'fetch-jsonp';
import * as dataLocations from './locations.json';
import FilterLocations from './FilterLocations';
import InfoWindow from './InfoWindow';


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      locations: dataLocations,
      map: '',
      markers: [],
      infoWindowIsOpen: false,
      currentMarker: {},
      infoContent: ''
    };
  }

  componentDidMount() {
    window.initMap = this.initMap;
    loadJS('https://maps.googleapis.com/maps/api/js?key=AIzaSyCYZ25jKwVmeCdDUN2oZSk94uvoSTNCQeE&callback=initMap');
  }

  initMap = () => {
    let controlledThis = this;
    const { locations, markers } = this.state;

    /* Define the map */
    let map = new window.google.maps.Map(document.getElementById('map'), {
      zoom: 10,
      center: { lat: 45.105962, lng: 24.369905 }
    });

    /* Keep state in sync */
    this.setState({
      map
    });

    /* Create a marker for each location in the locations.json file */
    for (let i = 0; i < locations.length; i++) {
      /* Define the values of the properties */
      let position = locations[i].position;
      let title = locations[i].title;
      let id = locations[i].key

      /* Create the marker itself */
      let marker = new window.google.maps.Marker({
        map: map,
        position: position,
        title: title,
        animation: window.google.maps.Animation.DROP,
        id: id
      });

      /* Get those markers into the state */
      markers.push(marker);

      /* Open infoWindow when click on the marker */
      marker.addListener('click', function () {
        controlledThis.openInfoWindow(marker);
      });
    }

    /* Add the listener to close the infoWindow when click on the map */
     map.addListener('click', function () {
      controlledThis.closeInfoWindow();
     });
  }

  openInfoWindow = (marker) => {
    this.setState({
      infoWindowIsOpen: true,
      currentMarker: marker
    });

    this.getInfos(marker);
  }

  closeInfoWindow = () => {
    this.setState({
      infoWindowIsOpen: false,
      currentMarker: {}
    });
  }

  getInfos = (marker) => {
    let controlledThis = this;
    let place = marker.title;
    let srcUrl = 'https://ro.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&titles=' + place;
    srcUrl = srcUrl.replace(/ /g, '%20');

    /* Fetch from Wikipedia API */
    fetchJsonp(srcUrl)
      .then(function(response) {
        return response.json();
      }).then(function (data) {
        /* Get the content of the response */
        let pages = data.query.pages;
        let pageId = Object.keys(data.query.pages)[0];
        let pageContent = pages[pageId].extract;

        /* Get the content into the state */
        controlledThis.setState({
          infoContent: pageContent
        });
      }).catch(function (error) {
        let pageError = 'Parsing failed ' + error;
        controlledThis.setState({
          infoContent: pageError
        });
      })
  }

  render() {
    return (
      <div className="App">
        <FilterLocations
          locationsList={this.state.locations}
          markers={this.state.markers}
          openInfoWindow={this.openInfoWindow}
        />

        {
          this.state.infoWindowIsOpen &&
          <InfoWindow
            currentMarker={this.state.currentMarker}
            infoContent={this.state.infoContent}
          />
        }

        <div id="map" role="application"></div>
      </div>
    );
  }
}

export default App;

function loadJS(src) {
  let ref = window.document.getElementsByTagName('script')[0];
  let script = window.document.createElement('script');

  script.src = src;
  script.async = true;
  ref.parentNode.insertBefore(script, ref);

  script.onerror = function () {
    document.write('Load error: Google Maps')
  };
}
