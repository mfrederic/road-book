<!DOCTYPE html>
<html>
<head>
  <title>Test moto Road Book</title>
  <meta charset="utf-8" />

  <link rel="stylesheet" type="text/css" href="fontello/css/fontello.css">
  <link rel="stylesheet" href="https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.4/themes/smoothness/jquery-ui.css">
  <link rel="stylesheet" type="text/css" href="fontello/css/animation.css">
  <link rel="stylesheet" type="text/css" href="css/leaflet-routing-machine.css">
  <link rel="stylesheet" type="text/css" href="http://cdn.jsdelivr.net/leaflet/0.7.3/leaflet.css" />
  <link rel="stylesheet" type="text/css" href="http://cdn-geoweb.s3.amazonaws.com/esri-leaflet-geocoder/1.0.0-rc.4/esri-leaflet-geocoder.css">
  <link rel="stylesheet" href="https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.4/themes/smoothness/jquery-ui.css">

  <link rel="stylesheet" type="text/css" href="css/generic.css">
  <link rel="stylesheet" type="text/css" href="css/general.css">

  <script type="text/javascript" src="js/jquery.js"></script>
  <script type="text/javascript" src="js/lodash.js"></script>
  <script src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.4/jquery-ui.min.js"></script>

  <script type="text/javascript" src="js/history/compressed/history.js"></script>
  <script type="text/javascript" src="js/history/compressed/history.adapter.jquery.js"></script>

  <script type="text/javascript" src="http://cdn.leafletjs.com/leaflet-0.7.3/leaflet.js"></script>
  <script type="text/javascript" src="js/leaflet/esri-leaflet.js"></script>
  <script type="text/javascript" src="js/leaflet/esri-leaflet-geocoder.js"></script>
  <script type="text/javascript" src="js/leaflet/esri-leaflet-gp.js"></script>
  <script type="text/javascript" src="js/leaflet/leaflet-routing-machine.min.js"></script>

  <script type="text/javascript" src="js/map-script/lang.fr.js"></script>
  <script type="text/javascript" src="js/map-script/utils.js"></script>
  <script type="text/javascript" src="js/map-script/build-instructions.js"></script>
  <script type="text/javascript" src="js/map-script/build-fields.js"></script>
  <script type="text/javascript" src="js/map-script/motoroadbook-core.js"></script>
  <script type="text/javascript" src="js/map-script/motoroadbook-script.js"></script>
</head>
<body>
  <div id="wrap_content">
    <div id="menu">

      <h1 class="title">Moto RoadBook</h1>
      <h3 class="under-title">Liste des points de passages <span class="add">+</span></h3>

      <div class="points animated">

      <?php
      extract($_GET);
      $waypoint = false;
      if(isset($w) && !empty($w)) {
        $waypoint = true;
        $waypoints = explode('!', $w);
      }
      ?>

      <?php if($waypoint) :
        foreach ($waypoints as $key => $point) :
        if(!empty($point)) : ?>
        <div class="point checkpoint">
          <label for="checkpoint_<?= $key; ?>">Par</label>
          <input list="list_<?= $key; ?>" type="text" placeholder="par" value="<?= $point; ?>" id="checkpoint_<?= $key; ?>" />
          <span class="clear"></span>
        </div>
      <?php endif; endforeach; else : ?>
        <div class="point checkpoint">
          <label for="checkpoint_a">Par</label>
          <input list="list_a" type="text" placeholder="par" id="checkpoint_a" />
          <span class="clear"></span>
        </div>

        <div class="point checkpoint">
          <label for="checkpoint_b">Par</label>
          <input list="list_b" type="text" placeholder="par" id="checkpoint_b" />
          <span class="clear"></span>
        </div>
      <?php endif; ?>
      </div>

      <datalist class="suggestions"></datalist>

      <table class="options" cellspacing="0" cellpadding="0">
        <tr>
          <td width="20%"><div title="Supprimer un point" class="remove icon-trash animated"></div></td>
          <td width="80%"><button id="calculate_route" class="btn">Calculer le trajet</button></td>
        </tr>
      </table>

    </div>


    <div id="map-canvas">

      <div id="route_informations">
        <div class="duration">
          <h4>Durée</h4>
          <span></span>
        </div>
        <div class="distance">
          <h4>Distance</h4>
          <span></span>
        </div>
      </div>
    </div>

    <div id="route_instructions"></div>
  </div>
</body>
</html>