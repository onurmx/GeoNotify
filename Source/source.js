//Initialize the map**********************************************************************************************
var map = L.map('mapid').setView([52.2347792, 20.9563998], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Onur Caglayan and Erol Gungor',
}).addTo(map);


//Array for saving waypoints**************************************************************************************
waypoints = [];
waypointArrivals = [];
waypointNo = 0;


//Waypoint Table**************************************************************************************************
var table = document.getElementById("routetable");


//Get User's Location*********************************************************************************************
var current_position;
var current_position_flag = 0;
var geocodeService = L.esri.Geocoding.geocodeService();
var tmpAddress;

function locate() {
    map.locate().on('locationfound', function (e) {
        if (current_position) {
            map.removeLayer(current_position);
        }
        const { lat, lng } = e.latlng;
        current_position = L.marker([lat, lng]).addTo(map);
        waypoints.push([lat, lng]);
        geocodeService.reverse().latlng([lat, lng]).run(function (error, result) {
            if (error) {
                return;
            }
            tmpAddress = result.address.Match_addr;
        });
    })
}

function saveIt() {
    var row = table.insertRow();
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);
    var cell4 = row.insertCell(3);
    waypointNo = waypointNo + 1;
    cell1.innerHTML = waypointNo;
    cell2.innerHTML = tmpAddress;
    cell3.innerHTML = document.getElementById("arrivaltime").value;
    if (waypointNo > 1) {
        waypointArrivals.push(document.getElementById("arrivaltime").value);
    }
    if (document.getElementById("waypointnote").value != "") {
        var button = document.createElement("button");
        button.innerHTML = "Waypoint Note";
        var wypnote = document.getElementById("waypointnote").value;
        button.addEventListener("click", () => {
            alert(wypnote);
        });
        cell4.appendChild(button);
    }
    document.getElementById("address").value = "";
    document.getElementById("arrivaltime").value = "";
    document.getElementById("waypointnote").value = "";
}

function positiontopath() {
    if (current_position_flag < 1 && document.getElementById("arrivaltime").value == "" && waypointNo == 0) {
        locate();
        setTimeout(saveIt, 2000);
        current_position_flag = current_position_flag + 1;
    }
    else {
        document.getElementById("address").value = "";
        document.getElementById("arrivaltime").value = "";
        document.getElementById("waypointnote").value = "";
    }
}


//Address input to path*******************************************************************************************
function addresstopath() {
    if ((document.getElementById("address").value != "" && document.getElementById("arrivaltime").value == "") || ((waypointNo > 0) && document.getElementById("address").value != "")) {
        findCoordinates(document.getElementById("address").value);
        var row = table.insertRow();
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);
        var cell4 = row.insertCell(3);
        waypointNo = waypointNo + 1;
        cell1.innerHTML = waypointNo;
        cell2.innerHTML = document.getElementById("address").value;
        cell3.innerHTML = document.getElementById("arrivaltime").value;
        if (waypointNo > 1) {
            waypointArrivals.push(document.getElementById("arrivaltime").value);
        }
        if (document.getElementById("waypointnote").value != "") {
            var button = document.createElement("button");
            button.innerHTML = "Waypoint Note";
            var wypnote = document.getElementById("waypointnote").value;
            button.addEventListener("click", () => {
                alert(wypnote);
            });
            cell4.appendChild(button);
        }
        document.getElementById("address").value = "";
        document.getElementById("arrivaltime").value = "";
        document.getElementById("waypointnote").value = "";
    }
    else {
        document.getElementById("address").value = "";
        document.getElementById("arrivaltime").value = "";
        document.getElementById("waypointnote").value = "";
    }
}


//Geocoding*******************************************************************************************************
addresstopathMarkers = [];
var search = L.esri.Geocoding.geocode();

function findCoordinates(address) {
    search.text(address).run((err, results, response) => {
        const { lat, lng } = results.results[0].latlng;
        addresstopathMarkers.push(L.marker([lat, lng]).addTo(map).bindPopup(document.getElementById("waypointnote").value));
        waypoints.push([lat, lng]);
    });
}


//Calculate Route with GraphHopper and start realtime location****************************************************
var control;
var segmentTimes = [];
var realtime_position;
var realtime_accuracy;
var watchPositionID;

function realtime_location() {
    watchPositionID = navigator.geolocation.watchPosition(onLocationFound, onLocationError, {
        maximumAge: 1000,
        timeout: 2000
    });
}

function onLocationFound(e) {
    if (realtime_position) {
        map.removeLayer(realtime_position);
        map.removeLayer(realtime_accuracy);
    }
    var radius = e.coords.accuracy / 10;
    const latlng = {
        lat: e.coords.latitude,
        lng: e.coords.longitude
    };
    realtime_position = L.marker(latlng);
    realtime_position.addTo(map).bindPopup("You are within " + radius + " meters from this point").openPopup();
    realtime_accuracy = L.circle(latlng, radius).addTo(map);
    nextWaypoint([realtime_position.getLatLng().lat, realtime_position.getLatLng().lng]);
    isAbleToCatch();
}

function onLocationError(e) {
    console.error("Location found error");
}

function calculateRoute() {
    if (waypoints.length >= 2) {
        control = L.Routing.control({
            waypoints,
            routeWhileDragging: true,
            router: L.Routing.graphHopper('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx')
        });
        control.addTo(map);
        control.on('routesfound', function (e) {
            var i = 0;
            e.routes[0].instructions.forEach(element => {
                if (element.type == "WaypointReached" || element.type == "DestinationReached") {
                    segmentTimes.push(0);
                }
            });
            e.routes[0].instructions.forEach(element => {
                if (element.type != "WaypointReached" && element.type != "DestinationReached") {
                    segmentTimes[i] = segmentTimes[i] + element.time;
                }
                else {
                    i++;
                }
            });
        });
        realtime_location();
    }
}


//Function which detects we are at next waypoint******************************************************************
var currentTargetWaypoint = 1;
var currentTargetWaypoint_cmp = 0;
function nextWaypoint(realtimePosition) {
    var distance = getDistance(realtimePosition, waypoints[currentTargetWaypoint]);
    if (distance < 30) {
        currentTargetWaypoint = currentTargetWaypoint + 1;
    }
}


//Notification function******************************************************************************************
var notificationtable = document.getElementById("notificationtable");

function isAbleToCatch() {
    if (currentTargetWaypoint != currentTargetWaypoint_cmp) {
        var currentTime = new Date();
        var arrivalTime = new Date();

        arrivalTime.setHours(waypointArrivals[currentTargetWaypoint - 1].substring(0, 2));
        arrivalTime.setMinutes(waypointArrivals[currentTargetWaypoint - 1].substring(3, 5));

        currentTime.setMinutes(currentTime.getMinutes() + Math.round(segmentTimes[currentTargetWaypoint - 1] / 60));

        if (currentTime.getHours() < arrivalTime.getHours() || ((currentTime.getHours() == arrivalTime.getHours()) && (currentTime.getMinutes() <= arrivalTime.getMinutes()))) {
            var today = new Date();
            var output_hours, output_minutes;
            if (today.getHours() < 10) { output_hours = "0" + today.getHours(); }
            else { output_hours = today.getHours(); }
            if (today.getMinutes() < 10) { output_minutes = "0" + today.getMinutes(); }
            else { output_minutes = today.getMinutes(); }

            arrivalTime.setMinutes(arrivalTime.getMinutes() - Math.round(segmentTimes[currentTargetWaypoint - 1] / 60));
            var output_hours2, output_minutes2;
            if (arrivalTime.getHours() < 10) { output_hours2 = "0" + arrivalTime.getHours(); }
            else { output_hours2 = arrivalTime.getHours(); }
            if (arrivalTime.getMinutes() < 10) { output_minutes2 = "0" + arrivalTime.getMinutes(); }
            else { output_minutes2 = arrivalTime.getMinutes(); }

            var row = notificationtable.insertRow();
            var cell1 = row.insertCell(0);
            var cell2 = row.insertCell(1);

            cell1.innerHTML = output_hours + ":" + output_minutes;
            cell2.innerHTML = "You should start your journey at least at " + output_hours2 + ":" + output_minutes2;
        }
        else {
            var today = new Date();
            var output_hours, output_minutes;
            if (today.getHours() < 10) { output_hours = "0" + today.getHours(); }
            else { output_hours = today.getHours(); }
            if (today.getMinutes() < 10) { output_minutes = "0" + today.getMinutes(); }
            else { output_minutes = today.getMinutes(); }

            var row = notificationtable.insertRow();
            var cell1 = row.insertCell(0);
            var cell2 = row.insertCell(1);

            cell1.innerHTML = output_hours + ":" + output_minutes;
            cell2.innerHTML = "You cannot be there at desired time";
        }
        currentTargetWaypoint_cmp = currentTargetWaypoint_cmp + 1;
    }
}


//Distance calculation by coordinates*****************************************************************************
function getDistance(origin, destination) {
    // return distance in meters
    var lon1 = toRadian(origin[1]),
        lat1 = toRadian(origin[0]),
        lon2 = toRadian(destination[1]),
        lat2 = toRadian(destination[0]);

    var deltaLat = lat2 - lat1;
    var deltaLon = lon2 - lon1;

    var a = Math.pow(Math.sin(deltaLat / 2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(deltaLon / 2), 2);
    var c = 2 * Math.asin(Math.sqrt(a));
    var EARTH_RADIUS = 6371;
    return c * EARTH_RADIUS * 1000;
}

function toRadian(degree) {
    return degree * Math.PI / 180;
}


//Some utility functions******************************************************************************************
function deleteLastRow(tableID) {
    var table = document.getElementById(tableID);
    var rowCount = table.rows.length;
    table.deleteRow(rowCount - 1);
}


//Reset***********************************************************************************************************
function reset() {
    //Stop realtime positioning
    if (watchPositionID) {
        navigator.geolocation.clearWatch(watchPositionID);
    }

    //Remove accuracy circle
    if (realtime_accuracy) {
        map.removeLayer(realtime_accuracy);
        realtime_accuracy = undefined;
    }

    //Remove realtime position marker
    if (realtime_position) {
        map.removeLayer(realtime_position);
        realtime_position = undefined;
    }

    //Remove Control from maps
    map.removeControl(control);

    //Reset values
    currentTargetWaypoint = 1;
    currentTargetWaypoint_cmp = 0;

    //Reset our Main Control
    control = undefined;

    //Empty our segment times array
    segmentTimes = [];

    //Remove "Address to Path" markers
    addresstopathMarkers.forEach(marker => {
        map.removeLayer(marker);
    });

    addresstopathMarkers = [];

    //Reset our temprorary address
    tmpAddress = undefined;

    //Reset our current position flag
    current_position_flag = 0;

    //Remove current position marker
    if (current_position) {
        map.removeLayer(current_position);
        current_position = undefined;
    }

    //Clear the input areas
    document.getElementById("address").value = "";
    document.getElementById("arrivaltime").value = "";
    document.getElementById("waypointnote").value = "";

    //Reset routing table
    var tableHeaderRowCount = 1;
    var table = document.getElementById('routetable');
    var rowCount = table.rows.length;
    for (var i = tableHeaderRowCount; i < rowCount; i++) {
        table.deleteRow(tableHeaderRowCount);
    }

    //Reset notification table
    tableHeaderRowCount = 1;
    table = document.getElementById('notificationtable');
    rowCount = table.rows.length;
    for (var i = tableHeaderRowCount; i < rowCount; i++) {
        table.deleteRow(tableHeaderRowCount);
    }

    //Reset our waypoint no
    waypointNo = 0;

    //Empty our waypoint arrivals
    waypointArrivals = [];

    //Empty our waypoints array
    waypoints = [];
}
