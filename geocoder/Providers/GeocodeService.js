EsriLeafletGeocoding.Controls.Geosearch.Providers.GeocodeService = EsriLeafletGeocoding.Services.Geocoding.extend({
  options: {
    label: 'Geocode Server',
    maxResults: 5
  },

  suggestions: function(text, bounds, callback){

    if (this.options.supportsSuggest) {
      var request = this.suggest().text(text);
      if(bounds){
        request.within(bounds);
      }

      return request.run(function(error, results, response){
        var suggestions = [];
        if(!error){
          while(response.suggestions.length && suggestions.length <= (this.options.maxResults - 1)){
            var suggestion = response.suggestions.shift();
            if(!suggestion.isCollection){
              suggestions.push({
                text: suggestion.text,
                magicKey: suggestion.magicKey
              });
            }
          }
        }
        callback(error, suggestions);
      }, this);
    }

    else {
      callback(undefined, []);
      return false;
    }
  },

  results: function(text, key, bounds, callback){
    var request = this.geocode().text(text);

    request.maxLocations(this.options.maxResults);

    if(bounds){
      request.within(bounds);
    }

    return request.run(function(error, response){
      callback(error, response.results);
    }, this);
  }
});