(function(){
    var _ = require( 'lodash'); 
    _.mixin( {
        'toQueryString': function ( parameters ) {
            var queryString = _.reduce(parameters, function ( components, value, key ) {
                        components.push( key + '=' + encodeURIComponent( value ) );
                        return components;
                    },[]).join( '&' );
            if ( queryString.length > 0 ) {
                queryString = '?' + queryString;
            }
            return queryString;
        },

        'fromQueryString': function ( queryString ) {
            return _.reduce(queryString.replace( '?', '' ).split( '&' ), function ( parameters, parameter ) {
                        if ( parameter.length > 0 ) {
                            _.extend( parameters, _.object( [ _.map( parameter.split( '=' ), decodeURIComponent ) ] ) );
                        }
                        return parameters;
                    }, {});
        }
    });
})();
