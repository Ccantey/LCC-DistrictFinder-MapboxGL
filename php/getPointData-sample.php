<?php
 
//database login info
# Connect to YOUR PostgreSQL database
$conn = new PDO('pgsql:host=###;dbname=####','####','####'); 

$lat = $_GET['lat'];
$long = $_GET['lng'];

//Here is the complex SQL to return all legislators:
//will have to do some phanagling to return appropriately formated data.
$sql = "(SELECT district, name, memid, party, ST_AsGeoJSON(ST_Transform((the_geom),4326),6) AS geojson FROM hse2012_1 WHERE
     ST_Intersects (
         hse2012_1.the_geom, ST_Transform(ST_SetSRID(ST_Point( $long, $lat),4326), 26915)
     )
) 

 UNION ALL

 (SELECT district, name, memid, party, ST_AsGeoJSON(ST_Transform((the_geom),4326),6)  FROM sen2012 WHERE
     ST_Intersects (
         sen2012.the_geom, ST_Transform(ST_SetSRID(ST_Point( $long, $lat),4326), 26915)
     )
)

 UNION ALL

(SELECT district, name, plan, party, ST_AsGeoJSON(ST_Transform((the_geom),4326),6) FROM cng2012 WHERE
     ST_Intersects (
         cng2012.the_geom, ST_Transform(ST_SetSRID(ST_Point( $long, $lat),4326), 26915)
     )
)";

$rs = $conn->query($sql);
if (!$rs) {
    echo 'An SQL error occured.\n';
    exit;
}
# Build GeoJSON feature collection array
$geojson = array(
   'type'      => 'FeatureCollection',
   'features'  => array()
);

# Loop through rows to build feature arrays
while ($row = $rs->fetch(PDO::FETCH_ASSOC)) {
    $properties = $row;
    # Remove geojson and geometry fields from properties
    unset($properties['geojson']);
    unset($properties['the_geom']);
    $feature = array(
         'type' => 'Feature',
         'geometry' => json_decode($row['geojson'], true),
         'properties' => $properties
    );
    # Add feature arrays to feature collection array
    array_push($geojson['features'], $feature);
}

header('Content-type: application/json');
echo json_encode($geojson,JSON_NUMERIC_CHECK );
$conn = NULL;
?>
