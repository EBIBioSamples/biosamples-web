const _ = require('lodash');

/**
 * Taken from underscore, get length of an element
 * @param obj
 * @returns 0 if object is null, length of the element otherwise
 */
function getLength(obj) {
    return obj === null ? void 0 : obj['length'];
}

function toObject(list, values) {
    let result = {};
    for (let i = 0, length = getLength(list); i < length; i++) {
        if (values) {
            result[list[i]] = values[i];
        } else {
            result[list[i][0]] = list[i][1];
        }
    }
    return result;
}

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
            let encodedFilter = encodeURI(`${key}|${value}`);
            filterArray.push(encodedFilter);
        }
    });
    return filterArray;
}

function toQueryString(parameters) {
    let queryString = _.reduce(parameters, function ( components, values, key ) {
        if ( _.isArray(values) || _.isObject(values)) {
            _.each(values, function (value) {
                components.push(`${key}=${encodeURIComponent(value)}`);
            });
        } else {
            components.push(`${key}=${encodeURIComponent(values)}`);
        }
        return components;
    },[]).join( '&' );
    // if ( queryString.length > 0 ) {
    //     queryString = '?' + queryString;
    // }
    return queryString;
}

function fromQueryString(queryString) {
    return _.reduce(queryString.replace( '?', '' ).split( '&' ), function ( parameters, parameter ) {
        if ( parameter.length > 0 ) {
            let paramObject = toObject( [ _.map( parameter.split( '=' ), decodeURIComponent ) ] );
            let paramKey = Object.keys(paramObject)[0];
            let paramValue = paramObject[paramKey];
            // TODO ParamKey should be an array of length 1, check for possible errors
            if ( parameters.hasOwnProperty(paramKey) ) {
                // TODO needs to be improved
                let multiValue;
                if (_.isArray(parameters[paramKey])) {
                    multiValue = parameters[paramKey];
                } else {
                    multiValue = [parameters[paramKey]];
                }
                multiValue.push(paramValue);
                parameters[paramKey] = multiValue;
            } else {
                _.extend( parameters, paramObject);
            }
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