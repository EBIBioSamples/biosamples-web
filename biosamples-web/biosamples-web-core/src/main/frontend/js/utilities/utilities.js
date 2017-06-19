const _ = require('lodash');

function deserializeFilterQuery(filter) {
    let filtersObj = {};
    let filtersArray = [];


    if (_.isString(filter)) {
        filtersArray = filter.split(',');
    } else if (!_.isNil(filter) && !_.isArray(filter)) {
        // This is a little bit cumbersome, make it clearer with "Optional" object
        filtersArray = [filter];
    } else {
        filtersArray = filter;
    }
    if(!_.isEmpty(filtersArray)) {
        filtersArray.forEach(function (value) {
            let decodedValue = decodeURI(value);
            let [filterKey, filterValue] = decodedValue.split('Filter|');
            if (!_.isEmpty(filterKey)) {
                // If the value is a number, coerce the value to number representation
                filtersObj[filterKey] = isNaN(filterValue) ? filterValue : +filterValue;
            }
        });
    }
    return filtersObj;
}

function serializeFilterQuery(filterQuery) {
    let filterArray = [];
    _.each(filterQuery, (value,key) => {
        if ( !_.isNil(value) ) {
            let encodedFilter = encodeURI(`${key}Filter|${value}`);
            filterArray.push(encodedFilter);
        }
    });
    return filterArray;
}

function toQueryString(parameters) {
    let queryString = _.reduce(parameters, function ( components, value, key ) {
        components.push( key + '=' + encodeURIComponent( value ) );
        return components;
    },[]).join( '&' );
    if ( queryString.length > 0 ) {
        queryString = '?' + queryString;
    }
    return queryString;
}

function fromQueryString(queryString) {
    return _.reduce(queryString.replace( '?', '' ).split( '&' ), function ( parameters, parameter ) {
        if ( parameter.length > 0 ) {
            _.extend( parameters, _.object( [ _.map( parameter.split( '=' ), decodeURIComponent ) ] ) );
        }
        return parameters;
    }, {});
}

module.exports = {
    deserializeFilterQuery,
    serializeFilterQuery,
    toQueryString,
    fromQueryString
};