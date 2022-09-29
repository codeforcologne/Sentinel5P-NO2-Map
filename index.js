/*
https://www.codefor.de/koeln/
contact@opendemdata.info 
based on Openlayers: https://openlayers.org/
License: BSD 2-Clause License
https://tldrlegal.com/license/bsd-2-clause-license-(freebsd)
*/
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import GeoJSON from "ol/format/GeoJSON";
import OSM from "ol/source/OSM";
import VectorTileSource from "ol/source/VectorTile";
import {
    Tile as TileLayer,
    VectorTile as VectorTileLayer
} from "ol/layer";
import Projection from "ol/proj/Projection";
import {
    defaults as defaultControls,
    Control
} from "ol/control";
import {
    Fill,
    Stroke,
    Style
} from "ol/style";
import CircleStyle from "ol/style/Circle";
import ImageLayer from "ol/layer/Image";
import ImageWMS from "ol/source/ImageWMS";
import Overlay from "ol/Overlay";
import {
    toStringHDMS
} from "ol/coordinate";
import {
    toLonLat
} from "ol/proj";

var startDate = new Date();
var begin;
var today;
var nomore = "2020-03-17";
var metaA;
var orbit1time;
var orbit2time;
var orbit3time;
var metaData;
var firstLoad = true;


// legende
var LegendControl = /*@__PURE__*/ (function(Control) {
    function LegendControl(opt_options) {
        var options = opt_options || {};

        var image = document.createElement('IMG');
        image.id = 'legendimg';
        image.src = 'legende_overview.png';
        image.title = 'Stickstoffdioxidgehalt der Troposphäre gemessen in Molekülenpro Quadratzentimeter mulipliziert mit dem Faktor 1.000.000';


        var element = document.createElement('div');
        element.id = 'legend_controll';
        element.style.cssText = 'position:absolute;top:10px;right:10px;';
        element.className = 'ol-unselectable ol-control';
        element.appendChild(image);

        Control.call(this, {
            element: element,
            target: options.target
        });

        image.addEventListener('click', this.handleLegend.bind(this), false);
    }

    if (Control) LegendControl.__proto__ = Control;
    LegendControl.prototype = Object.create(Control && Control.prototype);
    LegendControl.prototype.constructor = LegendControl;

    LegendControl.prototype.handleLegend = function handleLegend() {
        alert('Stickstoffdioxidgehalt der Troposphäre gemessen in Molekülen pro Quadratzentimeter mulipliziert mit dem Faktor 1.000.000');
    };

    return LegendControl;
}(Control));

// Custom Control Toggle Tools
var SwitchControl = /*@__PURE__*/ (function(Control) {
    function SwitchControl(opt_options) {
        var options = opt_options || {};
        var switchDiv = document.createElement("div");
        switchDiv.style.cssText =
            "position:absolute;top:0px;left:1px; width:30px; height:30px;";
        switchDiv.className = "switchDiv";
        switchDiv.id = "switchDiv";
        Control.call(this, {
            element: switchDiv,
            target: options.target,
        });
        switchDiv.addEventListener(
            "click",
            this.handleSwitchDivChange.bind(this),
            false
        );
    }
    if (Control) SwitchControl.__proto__ = Control;
    SwitchControl.prototype = Object.create(Control && Control.prototype);
    SwitchControl.prototype.constructor = SwitchControl;
    SwitchControl.prototype.handleSwitchDivChange = function handleSelection() {
        var selfDiv = document.getElementById("switchDiv");
        var controlEle = document.getElementById("controlEle");
        if (controlEle.style.display === "none") {
            controlEle.style.display = "block";
            selfDiv.className = "switchDiv";
        } else {
            controlEle.style.display = "none";
            selfDiv.className = "switchDivHide";
        }
    };
    return SwitchControl;
})(Control);

// Custom Control Selector Tools
var SelectorControl = /*@__PURE__*/ (function(Control) {
    function SelectorControl(opt_options) {
        var options = opt_options || {};

        // radios with orbits and start - end time

        // orbit all

        var radioOrbitAll = document.createElement("input");
        radioOrbitAll.type = "radio";
        radioOrbitAll.name = "radioGrp";
        radioOrbitAll.id = "radAll";
        radioOrbitAll.value = "myradioAll";
        radioOrbitAll.defaultChecked = true;
        radioOrbitAll.checked = true;
        var textNodeOrbitAll = document.createTextNode("alle Orbits");
        var labelOrbitAll = document.createElement("label");
        labelOrbitAll.id = "labelOrbitAll";
        labelOrbitAll.style.cssText = "position:absolute;top:110px;left:10px";
        labelOrbitAll.htmlFor = radioOrbitAll.id;
        labelOrbitAll.appendChild(radioOrbitAll);
        labelOrbitAll.appendChild(textNodeOrbitAll);

        // orbit 1

        var radioOrbit1 = document.createElement("input");
        radioOrbit1.type = "radio";
        radioOrbit1.name = "radioGrp";
        radioOrbit1.id = "rad1";
        radioOrbit1.value = "myradio1";
        var textNodeOrbit1 = document.createElement('span');
        textNodeOrbit1.id = "textNodeOrbit1";
        textNodeOrbit1.textContent = "Orbit1";
        var labelOrbit1 = document.createElement("label");
        labelOrbit1.id = "labelOrbit1";
        labelOrbit1.style.cssText = "position:absolute;top:130px;left:10px";
        labelOrbit1.htmlFor = radioOrbit1.id;
        labelOrbit1.appendChild(radioOrbit1);
        labelOrbit1.appendChild(textNodeOrbit1);

        // orbit 2
        var radioOrbit2 = document.createElement("input");
        radioOrbit2.type = "radio";
        radioOrbit2.name = "radioGrp";
        radioOrbit2.id = "rad2";
        radioOrbit2.value = "myradio2";
        var textNodeOrbit2 = document.createElement('span');
        textNodeOrbit2.id = "textNodeOrbit2";
        textNodeOrbit2.textContent = "Orbit2";
        var labelOrbit2 = document.createElement("label");
        labelOrbit2.id = "labelOrbit2";
        labelOrbit2.style.cssText = "position:absolute;top:150px;left:10px;";
        labelOrbit2.htmlFor = radioOrbit2.id;
        labelOrbit2.appendChild(radioOrbit2);
        labelOrbit2.appendChild(textNodeOrbit2);

        // Orbit 3
        var radioOrbit3 = document.createElement("input");
        radioOrbit3.type = "radio";
        radioOrbit3.name = "radioGrp";
        radioOrbit3.id = "rad3";
        radioOrbit3.value = "myradio3";
        var textNodeOrbit3 = document.createElement('span');
        textNodeOrbit3.id = "textNodeOrbit3";
        textNodeOrbit3.textContent = "Orbit3";

        var labelOrbit3 = document.createElement("label");
        labelOrbit3.id = "labelOrbit3";
        labelOrbit3.style.cssText = "position:absolute;top:170px;left:10px;";
        labelOrbit3.htmlFor = radioOrbit3.id;
        labelOrbit3.appendChild(radioOrbit3);
        labelOrbit3.appendChild(textNodeOrbit3);


        var text4div = document.createElement("p");
        text4div.id = "text4div";
        text4div.innerHTML = "Darstellung der Sentinel-5P NO<sub>2</sub> Daten für die Tropsophäre. Bitte für weitere Informationen die Hilfe lesen.";
        text4div.style.cssText = "position:absolute;top:0px;left:20px;";

        var element = document.createElement("div");
        element.style.cssText =
            "position:relative;top:10px;left:10px;background: lightcyan; width: 255px;";
        element.className = "ol-unselectable ol-control noiseselect";
        element.id = "controlEle";
        element.appendChild(text4div);
        element.appendChild(labelOrbitAll);
        element.appendChild(labelOrbit1);
        element.appendChild(labelOrbit2);
        element.appendChild(labelOrbit3);

        Control.call(this, {
            element: element,
            target: options.target,
        });

        labelOrbitAll.addEventListener(
            "change",
            this.handleRadioOrbitAllChange.bind(this),
            false
        );
        labelOrbit1.addEventListener(
            "change",
            this.handleRadioOrbit1Change.bind(this),
            false
        );

        labelOrbit2.addEventListener(
            "change",
            this.handleRadioOrbit2Change.bind(this),
            false
        );

        labelOrbit3.addEventListener(
            "change",
            this.handleRadioOrbit3Change.bind(this),
            false
        );
    }



    if (Control) SelectorControl.__proto__ = Control;
    SelectorControl.prototype = Object.create(Control && Control.prototype);
    SelectorControl.prototype.constructor = SelectorControl;

    SelectorControl.prototype.handleSelectionChange = function handleSelection() {
        updateWMS();
    };

    SelectorControl.prototype.handleRadioOrbitAllChange = function handleRadioOrbitAll() {
        // document.getElementById("objSpanNode2").innerHTML = "400";
        // document.getElementById("rangeslider").max = 400;

        begin = document.getElementById("textTimeslider").innerHTML;
        updateWMS();
    };

    SelectorControl.prototype.handleRadioOrbit1Change = function handleRadioOrbit1() {
        // document.getElementById("objSpanNode2").innerHTML = "400";
        // document.getElementById("rangeslider").max = 400;

        begin = orbit1time;

        updateWMS();

        // updateWMS();
    };
    SelectorControl.prototype.handleRadioOrbit2Change = function handleRadioOrbit2() {
        begin = orbit2time;

        updateWMS();
    };

    SelectorControl.prototype.handleRadioOrbit3Change = function handleRadioOrbit3() {
        // document.getElementById("objSpanNode2").innerHTML = "400";
        // document.getElementById("rangeslider").max = 400;

        begin = orbit3time;

        updateWMS();

        // updateWMS();
    };

    SelectorControl.prototype.handleSliderChange = function handleSilder() {};
    return SelectorControl;
})(Control);

// custom controller timeslider
var TimesliderControl = /*@__PURE__*/ (function(Control) {
    function TimesliderControl(opt_options) {
        var options = opt_options || {};
        var buttonBack = document.createElement("button");
        buttonBack.innerHTML = "<";
        var buttonForward = document.createElement("button");
        buttonForward.innerHTML = ">";
        var textTimeslider = document.createElement("div");
        textTimeslider.id = "textTimeslider";
        textTimeslider.innerHTML = "testdate";
        var element = document.createElement("div");
        element.style.cssText = "position:absolute;top:250px;left:10px;";
        element.className = "ol-unselectable ol-control timeslider";
        element.appendChild(buttonBack);
        element.appendChild(textTimeslider);
        element.appendChild(buttonForward);
        Control.call(this, {
            element: element,
            target: options.target,
        });
        buttonBack.addEventListener("click", this.handleBack.bind(this), false);
        buttonForward.addEventListener(
            "click",
            this.handleForward.bind(this),
            false
        );
    }
    if (Control) TimesliderControl.__proto__ = Control;
    TimesliderControl.prototype = Object.create(Control && Control.prototype);
    TimesliderControl.prototype.constructor = TimesliderControl;
    TimesliderControl.prototype.handleBack = function handleBack() {
        startDate = new Date(startDate.setDate(startDate.getDate() - 1));
        var yearbegin = startDate.getFullYear();
        var monthbegin = startDate.getMonth() + 1;
        if (monthbegin < 10) {
            monthbegin = "0" + monthbegin;
        }
        var daybegin = startDate.getDate();
        if (daybegin < 10) {
            daybegin = "0" + daybegin;
        }
        begin = yearbegin + "-" + monthbegin + "-" + daybegin;


        if (begin === nomore) {
            alert("Keine älteren Aufzeichnungen vorhanden.");
        }
        document.getElementById("textTimeslider").innerHTML = begin;
        document.getElementById("radAll").checked = true;
        updateWMS();
        getMetada();

    };
    TimesliderControl.prototype.handleForward = function handleForward() {
        startDate = new Date(startDate.setDate(startDate.getDate() + 1));
        var yearbegin = startDate.getFullYear();
        var monthbegin = startDate.getMonth() + 1;
        if (monthbegin < 10) {
            monthbegin = "0" + monthbegin;
        }
        var daybegin = startDate.getDate();
        if (daybegin < 10) {
            daybegin = "0" + daybegin;
        }
        begin = yearbegin + "-" + monthbegin + "-" + daybegin;
        if (begin === today) {
            alert("Die Daten für sind erst ab ca. 19:30 verfügbar.");
        }
        document.getElementById("textTimeslider").innerHTML = begin;
        document.getElementById("radAll").checked = true;
        updateWMS();
        getMetada();
    };
    return TimesliderControl;
})(Control);

// date
today = new Date();
var yeartoday = today.getFullYear();
var monthtoday = today.getMonth() + 1;
if (monthtoday < 10) {
    monthtoday = "0" + monthtoday;
}
var daytoday = today.getDate();
if (daytoday < 10) {
    daytoday = "0" + daytoday;
}
today = yeartoday + "-" + monthtoday + "-" + daytoday;

// ein Tag zurück da noch nicht die kompletten Daten da sind
startDate = new Date(startDate.setDate(startDate.getDate() - 1));
var yearbegin = startDate.getFullYear();
var monthbegin = startDate.getMonth() + 1;
if (monthbegin < 10) {
    monthbegin = "0" + monthbegin;
}
var daybegin = startDate.getDate();
if (daybegin < 10) {
    daybegin = "0" + daybegin;
}
begin = yearbegin + "-" + monthbegin + "-" + daybegin;

// test
//begin = "2020-04-13"

var wmsLayerSource = new ImageWMS({
    url: "https://www.opendem.info/geoserver/openair/wms",
    params: {
        LAYERS: "openair:no_s5p",
        time: begin
    },
    serverType: "geoserver",
    crossOrigin: "anonymous",
    attributions: ', Copernicus Sentinel data 2020',
});

wmsLayerSource.on('imageloadstart', function() {
    document.getElementById('loader').style.display = 'block';
});

wmsLayerSource.on('imageloadend', function() {
    document.getElementById('loader').style.display = 'none';
});

var wmsLayer = new ImageLayer({
    source: wmsLayerSource,
    maxResolution: 350
});

var wmsLayerSourceOverview = new ImageWMS({
    url: "https://www.opendem.info/geoserver/openair/wms",
    params: {
        LAYERS: "openair:no_s5p_overview",
        time: begin
    },
    serverType: "geoserver",
    crossOrigin: "anonymous",
    attributions: ', Copernicus Sentinel data 2020',
});


wmsLayerSourceOverview.on('imageloadstart', function() {
    document.getElementById('loader').style.display = 'block';


    if (firstLoad === true) {
        firstLoad = false;

        setTimeout(function() {
            alert('Das Laden der vielen Messpunkte kann unter Umständen bis zu 10 Sekunden dauern.');
        }, 1000);

    }

});

wmsLayerSourceOverview.on('imageloadend', function() {
    document.getElementById('loader').style.display = 'none';
});

var wmsLayerOverview = new ImageLayer({
    source: wmsLayerSourceOverview,
    minResolution: 350
});
// FeatureInfo
/**
 * Elements that make up the popup.
 */
var container = document.getElementById("popup");
var content = document.getElementById("popup-content");
var closer = document.getElementById("popup-closer");
/**
 * Create an overlay to anchor the popup to the map.
 */
var overlay = new Overlay({
    element: container,
    autoPan: true,
    autoPanAnimation: {
        duration: 250,
    },
});
/**
 * Add a click handler to hide the popup.
 * @return {boolean} Don't follow the href.
 */
closer.onclick = function() {
    overlay.setPosition(undefined);
    closer.blur();
    return false;
};
// Map
var view = new View({
    center: [1081125.0, 6599267.0],
    //center: [51.425, 7.66],
    zoom: 6,
});
var map = new Map({
    controls: defaultControls().extend([
        new TimesliderControl(),
        new SelectorControl(),
        new SwitchControl(),
        new LegendControl()
    ]),
    layers: [
        new TileLayer({
            source: new OSM({url:'https://tile.openstreetmap.org/{z}/{x}/{y}.png'}),
        }),
        wmsLayer, wmsLayerOverview
    ],
    overlays: [overlay],
    target: "map",
    view: view,
});

// change Legend depending on zoom & wms
map.getView().on('change:resolution', function(e) {

    var mapZoom = parseInt(view.getZoom(), 10);
    var legendimg = document.getElementById('legendimg')

    if (mapZoom < 9) {

        if (legendimg.src.indexOf("legende_no2.PNG") > -1) {
            legendimg.src = "legende_overview.png";
        }
    } else {
        if (legendimg.src.indexOf("legende_overview.png") > -1) {
            legendimg.src = "legende_no2.PNG";
        }


    }
});

document.getElementById("textTimeslider").innerHTML = begin;

function updateWMS() {

    var daydate = begin;

    wmsLayerOverview.getSource().updateParams({
        time: daydate
    });


    wmsLayer.getSource().updateParams({
        time: daydate
    });
}


// FeatureInfo
map.on("singleclick", function(evt) {
    var viewResolution = /** @type {number} */ (view.getResolution());
    var url = wmsLayerSource.getFeatureInfoUrl(
        evt.coordinate,
        viewResolution,
        "EPSG:3857", {
            INFO_FORMAT: "application/json"
        }
    );
    if (url) {
        fetch(url)
            .then(function(response) {
                return response.text();
            })
            .then(function(json) {
                var fi = JSON.parse(json);
                var coordinate = evt.coordinate;

                var date = new Date(fi.features[0].properties.timestamp);
                content.innerHTML =
                    "<p>Modellierter NO<sub>2</sub> Wert:<br/> " + fi.features[0].properties.value + " Moleküle/cm<sup>2</sup> <br/> Qualität: " + fi.features[0].properties.quality + "<br/> Latitude: " + fi.features[0].properties.latitude + "<br/> Longitude: " + fi.features[0].properties.longitude + "</p><p>" + date + "</p><p> <a target='_blank' href='https://opendem.info/ol6/s5p/download/s5p_no2_" + begin + ".json'>Download GeoJSON</a></p>";

                overlay.setPosition(coordinate);
            });
    }
});

// help
document.getElementById("helpIcon").addEventListener("click", help);

function help() {
    document.getElementById("help").style.display = "block";
    document.getElementById("head").style.pointerEvents = "none";
    document.getElementById("head").style.opacity = "50%";
    document.getElementById("map").style.pointerEvents = "none";
    document.getElementById("map").style.opacity = "50%";
}
document.getElementById("closeHelp").addEventListener("click", closeHelp);

function closeHelp() {
    document.getElementById("help").style.display = "none";
    document.getElementById("head").style.pointerEvents = "auto";
    document.getElementById("head").style.opacity = "1";
    document.getElementById("map").style.pointerEvents = "auto";
    document.getElementById("map").style.opacity = "1";
}
// legal notes
document.getElementById("legalIcon").addEventListener("click", legal);

function legal() {
    document.getElementById("legal").style.display = "block";
    document.getElementById("head").style.pointerEvents = "none";
    document.getElementById("head").style.opacity = "50%";
    document.getElementById("map").style.pointerEvents = "none";
    document.getElementById("map").style.opacity = "50%";
}
document.getElementById("closeLegal").addEventListener("click", closeLegal);

function closeLegal() {
    document.getElementById("legal").style.display = "none";
    document.getElementById("head").style.pointerEvents = "auto";
    document.getElementById("head").style.opacity = "1";
    document.getElementById("map").style.pointerEvents = "auto";
    document.getElementById("map").style.opacity = "1";
}


function getMetada() {

    var data = metaData;

    for (var i = 0; i < data.length; i++) {

        if (data[i].date == begin) {

            var orbit1 = document.getElementById("textNodeOrbit1");
            var orbit1start = data[i].orbit1start;
            var orbit1start1 = orbit1start.slice(9, 11);
            var orbit1start2 = orbit1start.slice(11, 13);
            var orbit1end = data[i].orbit1end;
            var orbit1end1 = orbit1end.slice(9, 11);
            var orbit1end2 = orbit1end.slice(11, 13);
            orbit1.textContent = 'Orbit ' + data[i].orbit1 + ': ' + orbit1start1 + ':' + orbit1start2 + ' - ' + orbit1end1 + ':' + orbit1end2 + " GMT";

            orbit1time = data[i].date + 'T' + orbit1start1 + ':' + orbit1start2 + ':00.000Z/' + data[i].date + 'T' + orbit1end1 + ':' + orbit1end2 + ':00.000Z';

            var orbit2 = document.getElementById("textNodeOrbit2");
            var orbit2start = data[i].orbit2start;
            var orbit2start1 = orbit2start.slice(9, 11);
            var orbit2start2 = orbit2start.slice(11, 13);
            var orbit2end = data[i].orbit2end;
            var orbit2end1 = orbit2end.slice(9, 11);
            var orbit2end2 = orbit2end.slice(11, 13);
            orbit2.textContent = 'Orbit ' + data[i].orbit2 + ': ' + orbit2start1 + ':' + orbit2start2 + ' - ' + orbit2end1 + ':' + orbit2end2 + " GMT";
            orbit2time = data[i].date + 'T' + orbit2start1 + ':' + orbit2start2 + ':00.000Z/' + data[i].date + 'T' + orbit2end1 + ':' + orbit2end2 + ':00.000Z';

            var orbit3 = document.getElementById("textNodeOrbit3");
            if (data[i].orbit3 != '') {
                var orbit3start = data[i].orbit3start;
                var orbit3start1 = orbit3start.slice(9, 11);
                var orbit3start2 = orbit3start.slice(11, 13);
                var orbit3end = data[i].orbit3end;
                var orbit3end1 = orbit3end.slice(9, 11);
                var orbit3end2 = orbit3end.slice(11, 13);
                orbit3.textContent = 'Orbit ' + data[i].orbit3 + ': ' + orbit3start1 + ':' + orbit3start2 + ' - ' + orbit3end1 + ':' + orbit3end2 + " GMT";
                orbit3time = data[i].date + 'T' + orbit3start1 + ':' + orbit3start2 + ':00.000Z/' + data[i].date + 'T' + orbit3end1 + ':' + orbit3end2 + ':00.000Z';
            } else {
                orbit3.textContent = '-'
                document.getElementById('rad3').disabled = true;
            }

        }

    }


}

function documentLoaded(e) {
    // handle very small displays
    if (innerWidth < 430) {
        var title = document.getElementById("titleApp");
        title.style.fontSize = "1.2rem";
        title.style.top = "0px";

        var titleHelp = document.getElementById("helpText");
        titleHelp.innerText = "Über, Hilfe, Informationen und Daten";

        var legend_controll = document.getElementById("legend_controll");
        legend_controll.style.right = '0px';



    }

    // load metadata 
    fetch('https://opendem.info/ol6/s5p/download/s5p_no.json', {
            mode: 'cors'
        })
        .then((response) => {
            response.json().then((data) => {
                metaData = data;
                getMetada();
            });
        })
        .catch((err) => {
            alert('Laden der Metadaten fehlgeschlagen');
        });


}
document.addEventListener("DOMContentLoaded", documentLoaded);
